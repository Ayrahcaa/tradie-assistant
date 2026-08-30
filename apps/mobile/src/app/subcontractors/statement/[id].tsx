import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { Share, ScrollView, StyleSheet, Text, View } from "react-native";
import { get } from "../../../api/client";
import { NavHeader } from "../../../components/form-screen";
import { AppButton, Card, ErrorState, LoadingState, MoneyValue, Screen } from "../../../components/ui";
import { colors, spacing } from "../../../theme";

interface StatementData { subcontractor:{firstName:string;lastName:string|null;businessName:string|null};range:{from:string;to:string};entries:{id:string;description:string|null;agreedAmount:string|number;project:{name:string};payments:{id:string;amount:string|number;paidAt:string}[]}[];totalAgreed:string|number;totalPaid:string|number;balance:string|number }
const money = (value:string|number) => new Intl.NumberFormat("en-AU", { style:"currency", currency:"AUD" }).format(Number(value));

export default function SubcontractorStatement() {
  const { id } = useLocalSearchParams<{id:string}>();
  const query = useQuery({ queryKey:["subcontractor-statement",id], queryFn:()=>get<StatementData>(`/financial/subcontractors/${id}/statement?preset=financial-year`) });
  if (query.isLoading) return <LoadingState />;
  if (query.isError) return <ErrorState message="We couldn't load this statement." retry={query.refetch} />;
  const statement=query.data!; const name=statement.subcontractor.businessName||`${statement.subcontractor.firstName} ${statement.subcontractor.lastName||""}`;
  const message=[`${name} — Subcontractor Statement`,"",...statement.entries.map((entry)=>`${entry.project.name}: ${money(entry.agreedAmount)}`),"",`Payments: -${money(statement.totalPaid)}`,`Balance: ${money(statement.balance)}`].join("\n");
  return <Screen><NavHeader title="Statement"/><ScrollView contentContainerStyle={styles.content}><Card style={styles.hero}><Text style={styles.name}>{name}</Text><Text style={styles.heroMeta}>Current financial year</Text><Text style={styles.label}>BALANCE</Text><MoneyValue value={statement.balance}/></Card><AppButton title="Share statement" onPress={()=>void Share.share({title:`${name} statement`,message})}/>{statement.entries.map((entry)=><Card key={entry.id} style={styles.card}><View style={styles.row}><View style={{flex:1}}><Text style={styles.item}>{entry.project.name}</Text><Text style={styles.meta}>{entry.description||"Project work"}</Text></View><Text style={styles.item}>{money(entry.agreedAmount)}</Text></View>{entry.payments.map((payment)=><Text key={payment.id} style={styles.payment}>Payment · -{money(payment.amount)}</Text>)}</Card>)}</ScrollView></Screen>;
}
const styles=StyleSheet.create({content:{padding:spacing.md,paddingBottom:40,gap:spacing.sm},hero:{backgroundColor:colors.text,borderColor:colors.text,gap:7},name:{fontSize:22,fontWeight:"800",color:"white"},heroMeta:{color:"#AEB8B5"},meta:{color:colors.muted},label:{fontSize:11,fontWeight:"800",letterSpacing:1,color:"#AEB8B5",marginTop:spacing.md},card:{gap:10},row:{flexDirection:"row",alignItems:"center",gap:spacing.sm},item:{fontWeight:"800",color:colors.text},payment:{color:colors.success,fontWeight:"700",fontSize:13}});
