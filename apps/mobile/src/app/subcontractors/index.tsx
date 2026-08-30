import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { FileText } from "lucide-react-native";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text } from "react-native";
import { get } from "../../api/client";
import { NavHeader } from "../../components/form-screen";
import { Card, EmptyState, ErrorState, LoadingState, Screen } from "../../components/ui";
import { colors, spacing } from "../../theme";
import type { Subcontractor } from "../../types/api";

export default function Subcontractors() {
  const query = useQuery({ queryKey: ["subcontractors"], queryFn: () => get<Subcontractor[]>("/subcontractors") });
  if (query.isLoading) return <LoadingState />;
  if (query.isError) return <ErrorState message="We couldn't load subcontractors." retry={query.refetch} />;
  return <Screen><NavHeader title="Subcontractors" /><FlatList data={query.data} keyExtractor={(item) => item.id} refreshControl={<RefreshControl tintColor={colors.primaryDark} refreshing={query.isRefetching} onRefresh={query.refetch} />} contentContainerStyle={styles.list} ListEmptyComponent={<EmptyState title="No subcontractors" message="Add subcontractors on web to manage project work and payments." />} renderItem={({ item }) => <Card style={styles.card}><Pressable style={{ flex: 1 }} onPress={() => router.push(`/subcontractors/${item.id}`)}><Text style={styles.name}>{item.firstName} {item.lastName}</Text><Text style={styles.meta}>{item.businessName ?? item.email ?? item.phone ?? "No contact details"}</Text>{item.abn ? <Text style={styles.meta}>ABN {item.abn}</Text> : null}</Pressable><Pressable accessibilityLabel={`Open statement for ${item.firstName}`} onPress={() => router.push(`/subcontractors/statement/${item.id}`)} style={styles.statement}><FileText size={18} color={colors.primaryDark} /><Text style={styles.statementText}>Statement</Text></Pressable></Card>} /></Screen>;
}
const styles = StyleSheet.create({ list: { padding: spacing.md }, card: { marginBottom: spacing.sm, gap: spacing.md }, name: { fontWeight: "800", fontSize: 17, color: colors.text }, meta: { color: colors.muted, marginTop: 4 }, statement: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 7, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, width: "100%" }, statementText: { fontWeight: "700", color: colors.primaryDark } });
