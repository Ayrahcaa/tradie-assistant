import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { get } from "../../api/client";
import { NavHeader } from "../../components/form-screen";
import { useAuth } from "../../auth/auth-context";
import { AppButton, Card, ErrorState, LoadingState, MoneyValue, Screen, StatusBadge } from "../../components/ui";
import { colors, spacing } from "../../theme";
import type { Quote } from "../../types/api";
import { shareDocument } from "../../utils/sharing";

export default function QuoteDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const query = useQuery({ queryKey: ["quote", id], queryFn: () => get<Quote>(`/quotes/${id}`) });
  if (query.isLoading) return <LoadingState />;
  if (query.isError) return <ErrorState message={query.error.message} retry={query.refetch} />;
  const quote = query.data!;
  return <Screen>
    <NavHeader title={quote.quoteNumber} />
    <ScrollView contentContainerStyle={styles.content}>
      <Card style={styles.hero}><View style={styles.row}><Text style={styles.name}>{quote.title}</Text><StatusBadge status={quote.status} /></View><Text style={styles.meta}>{quote.customer.firstName} {quote.customer.lastName} · {quote.project?.name ?? "No project"}</Text><MoneyValue value={quote.totalAmount} />{quote.expiryDate ? <Text style={styles.meta}>Expires {new Date(quote.expiryDate).toLocaleDateString("en-AU")}</Text> : null}</Card>
      <AppButton title="Share quote" onPress={() => user && shareDocument({ kind: "Quote", number: quote.quoteNumber, customerName: `${quote.customer.firstName} ${quote.customer.lastName}`, projectName: quote.project?.name, total: quote.totalAmount }, user)} />
      <Text style={styles.section}>Line items</Text>
      {quote.items.map((item) => <Card key={item.id} style={styles.row}><View style={{ flex: 1 }}><Text style={styles.item}>{item.description}</Text><Text style={styles.meta}>{Number(item.quantity)} × ${Number(item.unitPrice).toFixed(2)}</Text></View><MoneyValue value={item.lineTotal} /></Card>)}
    </ScrollView>
  </Screen>;
}

const styles = StyleSheet.create({ content: { padding: spacing.md, paddingBottom: 40, gap: spacing.sm }, hero: { gap: spacing.sm }, row: { flexDirection: "row", alignItems: "center", gap: spacing.sm }, name: { fontSize: 22, fontWeight: "900", color: colors.text, flex: 1 }, meta: { color: colors.muted }, section: { fontSize: 18, fontWeight: "900", color: colors.text, marginTop: spacing.lg }, item: { fontWeight: "800", color: colors.text } });
