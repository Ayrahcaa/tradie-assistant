import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { get } from "../../api/client";
import { ContactActions } from "../../components/contact-actions";
import { NavHeader } from "../../components/form-screen";
import { Card, ErrorState, LoadingState, MoneyValue, Screen, StatusBadge } from "../../components/ui";
import { colors, spacing } from "../../theme";
import type { CustomerOverview } from "../../types/api";

export default function CustomerDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useQuery({ queryKey: ["customer", id], queryFn: () => get<CustomerOverview>(`/analytics/customers/${id}`) });
  if (query.isLoading) return <LoadingState />;
  if (query.isError) return <ErrorState message={query.error.message} retry={query.refetch} />;
  const { customer, financials } = query.data!;
  return <Screen><NavHeader title={`${customer.firstName} ${customer.lastName}`} /><ScrollView contentContainerStyle={styles.content}>
    <Card style={styles.card}><Text style={styles.name}>{customer.firstName} {customer.lastName}</Text>{[customer.businessName, customer.email, customer.phone, customer.address, customer.abn ? `ABN ${customer.abn}` : null].filter(Boolean).map((value) => <Text key={value} style={styles.meta}>{value}</Text>)}<ContactActions phone={customer.phone} email={customer.email} /></Card>
    <View style={styles.grid}>{[["Invoiced", financials.totalInvoiced], ["Paid", financials.totalPaid], ["Outstanding", financials.outstanding]].map(([label, value]) => <Card key={label} style={styles.metric}><Text style={styles.meta}>{label}</Text><MoneyValue value={value} /></Card>)}</View>
    <Text style={styles.section}>Projects</Text>{customer.projects.map((project) => <Pressable key={project.id} onPress={() => router.push(`/projects/${project.id}`)}><Card style={styles.row}><View style={{ flex: 1 }}><Text style={styles.item}>{project.name}</Text><Text style={styles.meta}>{project.address ?? "No address"}</Text></View><StatusBadge status={project.status} /></Card></Pressable>)}
    <Text style={styles.section}>Invoices</Text>{customer.invoices.map((invoice) => <Pressable key={invoice.id} onPress={() => router.push(`/invoices/${invoice.id}`)}><Card style={styles.row}><View style={{ flex: 1 }}><Text style={styles.item}>{invoice.invoiceNumber}</Text><Text style={styles.meta}>{invoice.status}</Text></View><MoneyValue value={invoice.balanceDue} /></Card></Pressable>)}
  </ScrollView></Screen>;
}
const styles = StyleSheet.create({ content: { paddingBottom: 40 }, card: { margin: spacing.md, gap: 5 }, name: { fontSize: 23, fontWeight: "900", color: colors.text }, meta: { color: colors.muted }, grid: { flexDirection: "row", gap: spacing.sm, paddingHorizontal: spacing.md }, metric: { flex: 1, gap: 8, padding: 12 }, section: { fontSize: 18, fontWeight: "900", color: colors.text, margin: spacing.md, marginTop: spacing.lg }, row: { marginHorizontal: spacing.md, marginBottom: spacing.sm, flexDirection: "row", alignItems: "center", gap: spacing.sm }, item: { fontWeight: "800", color: colors.text } });
