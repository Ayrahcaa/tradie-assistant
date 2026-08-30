import { Mail, MessageCircle, Phone } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../theme";
import { openContact } from "../utils/sharing";
export function ContactActions({phone,email}:{phone?:string|null;email?:string|null}){if(!phone&&!email)return null;return <View style={styles.row}>{phone?<><Action label="Call" Icon={Phone} onPress={()=>void openContact("call",phone)}/><Action label="WhatsApp" Icon={MessageCircle} onPress={()=>void openContact("whatsapp",phone)}/></>:null}{email?<Action label="Email" Icon={Mail} onPress={()=>void openContact("email",email)}/>:null}</View>}
function Action({label,Icon,onPress}:{label:string;Icon:typeof Phone;onPress:()=>void}){return <Pressable onPress={onPress} style={({pressed})=>[styles.action,pressed&&{opacity:.65}]}><Icon size={18} color={colors.primaryDark}/><Text style={styles.label}>{label}</Text></Pressable>}
const styles=StyleSheet.create({row:{flexDirection:"row",flexWrap:"wrap",gap:spacing.sm,marginTop:spacing.sm},action:{minHeight:44,flexDirection:"row",alignItems:"center",gap:7,paddingHorizontal:14,borderRadius:12,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface},label:{fontWeight:"800",color:colors.text}});
