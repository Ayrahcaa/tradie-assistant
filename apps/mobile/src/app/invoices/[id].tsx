import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { get, post } from "../../api/client";
import { NavHeader } from "../../components/form-screen";
import { useAuth } from "../../auth/auth-context";
import { AppButton, AppInput, Card, ErrorState, LoadingState, MoneyValue, Screen, StatusBadge } from "../../components/ui";
import { colors, spacing } from "../../theme";
import type { Invoice } from "../../types/api";
import { shareDocument } from "../../utils/sharing";

export default function InvoiceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const query = useQuery({ queryKey: ["invoice", id], queryFn: () => get<Invoice>(`/invoices/${id}`) });
  const payment = useMutation({
    mutationFn: () => post("/payments", { invoiceId: id, amount: Number(amount), method: "BANK_TRANSFER", reference: reference || null }),
    onSuccess: async () => {
      setAmount(""); setReference("");
      await Promise.all([qc.invalidateQueries({ queryKey: ["invoice", id] }), qc.invalidateQueries({ queryKey: ["invoices"] }), qc.invalidateQueries({ queryKey: ["analytics"] })]);
      Alert.alert("Payment recorded");
    },
  });
  if (query.isLoading) return <LoadingState />;
  if (query.isError) return <ErrorState message={query.error.message} retry={query.refetch} />;
  const invoice = query.data!;
  const balance = Number(invoice.balanceDue);
  return <Screen>
    <NavHeader title={invoice.invoiceNumber} />
    <ScrollView contentContainerStyle={styles.content}>
      <Card style={styles.hero}>
        <View style={styles.row}><View style={{ flex: 1 }}><Text style={styles.name}>{invoice.invoiceNumber}</Text><Text style={styles.meta}>{invoice.title}</Text></View><StatusBadge status={invoice.status} /></View>
        <Text style={styles.meta}>{invoice.customer.firstName} {invoice.customer.lastName} · {invoice.project?.name ?? "No project"}</Text>
        <View style={styles.moneyRow}><View><Text style={styles.meta}>Total</Text><MoneyValue value={invoice.totalAmount} /></View><View><Text style={styles.meta}>Paid</Text><MoneyValue value={invoice.amountPaid} color={colors.success} /></View><View><Text style={styles.meta}>Balance</Text><MoneyValue value={balance} color={balance ? colors.danger : colors.success} /></View></View>
        {invoice.dueDate ? <Text style={styles.meta}>Due {new Date(invoice.dueDate).toLocaleDateString("en-AU")}</Text> : null}
      </Card>
      <AppButton title="Share invoice" onPress={() => user && shareDocument({ kind: "Invoice", number: invoice.invoiceNumber, customerName: `${invoice.customer.firstName} ${invoice.customer.lastName}`, projectName: invoice.project?.name, total: invoice.totalAmount, paid: invoice.amountPaid, outstanding: invoice.balanceDue, dueDate: invoice.dueDate }, user)} />
      <Text style={styles.section}>Line items</Text>
      {invoice.items.map((item) => <Card key={item.id} style={styles.item}><View style={{ flex: 1 }}><Text style={styles.itemName}>{item.description}</Text><Text style={styles.meta}>{Number(item.quantity)} × ${Number(item.unitPrice).toFixed(2)}</Text></View><MoneyValue value={item.lineTotal} /></Card>)}
      <Text style={styles.section}>Payment history</Text>
      {invoice.payments.map((item) => <Card key={item.id} style={styles.item}><View style={{ flex: 1 }}><Text style={styles.itemName}>{new Date(item.paidAt).toLocaleDateString("en-AU")}</Text><Text style={styles.meta}>{item.reference ?? item.method ?? "Payment"}</Text></View><MoneyValue value={item.amount} color={colors.success} /></Card>)}
      {balance > 0 && invoice.status !== "CANCELLED" ? <Card style={styles.form}><Text style={styles.itemName}>Record payment received</Text><AppInput label="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder={balance.toFixed(2)} /><AppInput label="Reference" value={reference} onChangeText={setReference} />{payment.error ? <Text style={styles.error}>{payment.error.message}</Text> : null}<AppButton title="Record payment" loading={payment.isPending} disabled={!(Number(amount) > 0 && Number(amount) <= balance)} onPress={() => payment.mutate()} /><AppButton title="Pay online · Coming soon" variant="secondary" disabled /></Card> : null}
    </ScrollView>
  </Screen>;
}

const styles = StyleSheet.create({ content: { padding: spacing.md, paddingBottom: 40, gap: spacing.sm }, hero: { gap: spacing.sm }, row: { flexDirection: "row", gap: spacing.md }, name: { fontSize: 23, fontWeight: "900", color: colors.text }, meta: { color: colors.muted }, moneyRow: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.sm }, section: { fontSize: 18, fontWeight: "900", color: colors.text, marginTop: spacing.lg }, item: { flexDirection: "row", alignItems: "center", gap: spacing.sm }, itemName: { fontWeight: "800", color: colors.text, fontSize: 16 }, form: { gap: spacing.md, marginTop: spacing.lg }, error: { color: colors.danger } });
