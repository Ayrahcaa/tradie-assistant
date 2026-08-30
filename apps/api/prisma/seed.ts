import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { hashPassword } from "../src/modules/auth/password.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not defined.");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const id = (group: number, item: number) => `${String(group).padStart(8, "0")}-0000-4000-8000-${String(item).padStart(12, "0")}`;
const d = (value: string) => new Date(`${value}T10:00:00+09:30`);

async function main(): Promise<void> {
  const email = process.env.DEMO_USER_EMAIL ?? "demo@tradieassistant.com";
  const demoPassword = process.env.DEMO_USER_PASSWORD ?? "TradieDemo2026!";
  const user = await prisma.user.upsert({
    where: { email },
    update: { firstName: "Daniel", lastName: "Taylor", businessName: "Taylor Trade Services", abn: "53 901 234 567", phone: "0412 555 010", address: "15 Hutt Street, Adelaide SA 5000", tradeType: "Renovations and general building", gstRegistered: true, businessStructure:"SOLE_TRADER",gstAccountingMethod:"CASH",basFrequency:"QUARTERLY",taxProfile:"AUSTRALIAN_RESIDENT_INDIVIDUAL",taxFinancialYear:"2026-27",otherTaxableIncome:5000 },
    create: { id: id(1, 1), firstName: "Daniel", lastName: "Taylor", email, businessName: "Taylor Trade Services", abn: "53 901 234 567", phone: "0412 555 010", address: "15 Hutt Street, Adelaide SA 5000", tradeType: "Renovations and general building", gstRegistered: true, businessStructure:"SOLE_TRADER",gstAccountingMethod:"CASH",basFrequency:"QUARTERLY",taxProfile:"AUSTRALIAN_RESIDENT_INDIVIDUAL",taxFinancialYear:"2026-27",otherTaxableIncome:5000 },
  });
  const demoPasswordHash = await hashPassword(demoPassword);
  await prisma.passwordCredential.upsert({
    where: { userId: user.id },
    update: { passwordHash: demoPasswordHash },
    create: { userId: user.id, passwordHash: demoPasswordHash },
  });

  await prisma.$transaction(async (tx) => {
    await tx.subcontractorPayment.deleteMany({ where: { ownerId: user.id } });
    await tx.paygInstalment.deleteMany({ where: { ownerId: user.id } });
    await tx.subcontractorProjectCost.deleteMany({ where: { ownerId: user.id } });
    await tx.receipt.deleteMany({ where: { ownerId: user.id } });
    await tx.payment.deleteMany({ where: { ownerId: user.id } });
    await tx.invoice.deleteMany({ where: { ownerId: user.id } });
    await tx.quote.deleteMany({ where: { ownerId: user.id } });
    await tx.expense.deleteMany({ where: { ownerId: user.id } });
    await tx.project.deleteMany({ where: { ownerId: user.id } });
    await tx.customer.deleteMany({ where: { ownerId: user.id } });
    await tx.subcontractor.deleteMany({ where: { ownerId: user.id } });

    const customers = [
      [1,"Olivia","Smith",null,"olivia.smith@example.com","0412 555 104","18 Seaview Road, Brighton SA 5048",null],
      [2,"Liam","Nguyen",null,"liam.nguyen@example.com","0423 555 218","44 Bridge Street, Kensington SA 5068",null],
      [3,"Sophie","Williams","Williams Property Co","sophie@williamsproperty.example","0408 555 392","92 King William Road, Goodwood SA 5034","71 234 567 890"],
      [4,"Noah","Brown",null,"noah.brown@example.com","0431 555 477","7 Pier Lane, Glenelg SA 5045",null],
      [5,"Amelia","Martin","Martin Allied Health","amelia@martinhealth.example","0417 555 563","126 The Parade, Norwood SA 5067","38 765 432 109"],
      [6,"Jack","Wilson","Wilson Developments","jack@wilsondevelopments.example","0402 555 681","15 Hutt Street, Adelaide SA 5000","92 345 678 012"],
      [7,"Mia","Anderson",null,"mia.anderson@example.com","0428 555 746","31 East Terrace, Henley Beach SA 5022",null],
    ] as const;
    for (const [n,firstName,lastName,businessName,emailAddress,phone,address,abn] of customers) await tx.customer.create({ data: { id:id(2,n), firstName,lastName,businessName,email:emailAddress,phone,address,abn,notes:n===1?"Prefers weekday updates by SMS.":null,ownerId:user.id } });

    const projects = [
      [1,"Smith Bathroom Renovation",1,"Full bathroom renovation including waterproofing, tiling and new fixtures.","18 Seaview Road, Brighton SA 5048",28500,"ACTIVE","2026-07-08","2026-09-12"],
      [2,"Richmond Kitchen Upgrade",2,"Kitchen cabinetry, splashback and electrical upgrade.","44 Bridge Street, Kensington SA 5068",34200,"ACTIVE","2026-06-15","2026-08-30"],
      [3,"Glenelg Apartment Tiling",4,"Floor and bathroom tiling for a two-bedroom apartment.","7 Pier Lane, Glenelg SA 5045",18700,"ACTIVE","2026-08-03","2026-09-02"],
      [4,"Norwood Ensuite Renovation",5,"Premium ensuite renovation for allied health premises.","126 The Parade, Norwood SA 5067",22100,"COMPLETED","2026-03-10","2026-05-22"],
      [5,"Adelaide Office Fitout",6,"Internal walls, flooring and staff kitchen fitout.","15 Hutt Street, Adelaide SA 5000",68500,"ACTIVE","2026-07-21","2026-11-14"],
      [6,"Goodwood Rental Refresh",3,"Paint, repairs and flooring between tenants.","63 Gilbert Street, Goodwood SA 5034",14800,"COMPLETED","2026-01-12","2026-02-20"],
      [7,"Henley Beach Deck",7,"New spotted gum entertaining deck and privacy screen.","31 East Terrace, Henley Beach SA 5022",19600,"ACTIVE","2026-08-11","2026-10-03"],
      [8,"Unley Laundry Conversion",3,"Convert store room into laundry and utility space.","20 Young Street, Unley SA 5061",12600,"ARCHIVED","2025-10-01","2025-11-15"],
    ] as const;
    for (const [n,name,customer,description,address,quotedValue,status,start,end] of projects) await tx.project.create({ data:{id:id(3,n),name,customerId:id(2,customer),clientName:`${customers[customer-1][1]} ${customers[customer-1][2]}`,description,address,quotedValue,status,startDate:d(start),endDate:d(end),ownerId:user.id} });

    const quotes = [
      [1,"Q-2026-DEMO-001",1,1,"Bathroom renovation proposal","ACCEPTED",24000],[2,"Q-2026-DEMO-002",2,2,"Kitchen upgrade proposal","ACCEPTED",29000],[3,"Q-2026-DEMO-003",4,3,"Apartment tiling proposal","ACCEPTED",16000],[4,"Q-2026-DEMO-004",6,5,"Office fitout stage one","SENT",50000],[5,"Q-2026-DEMO-005",7,7,"Spotted gum deck","DRAFT",17000],[6,"Q-2026-DEMO-006",5,4,"Ensuite renovation","ACCEPTED",19000],
    ] as const;
    for(const [n,quoteNumber,customer,project,title,status,subtotal] of quotes) await tx.quote.create({data:{id:id(4,n),quoteNumber,customerId:id(2,customer),projectId:id(3,project),title,status,issueDate:d("2026-07-01"),expiryDate:d("2026-09-01"),subtotal,gstAmount:subtotal*.1,totalAmount:subtotal*1.1,terms:"Payment terms: 14 days.",ownerId:user.id,items:{create:[{description:title,quantity:1,unitPrice:subtotal,lineTotal:subtotal,sortOrder:0}]}}});

    const invoices = [
      [1,"INV-2026-DEMO-001",1,1,"Bathroom renovation progress claim","PARTIALLY_PAID","2026-07-20","2026-08-20",18000,10000],
      [2,"INV-2026-DEMO-002",2,2,"Kitchen upgrade final invoice","OVERDUE","2026-06-30","2026-07-14",29000,12000],
      [3,"INV-2026-DEMO-003",4,3,"Tiling deposit","SENT","2026-08-05","2026-08-19",8000,0],
      [4,"INV-2026-DEMO-004",5,4,"Ensuite renovation final","PAID","2026-05-20","2026-06-03",19000,20900],
      [5,"INV-2026-DEMO-005",6,5,"Office fitout stage one","PARTIALLY_PAID","2026-08-01","2026-08-15",30000,20000],
      [6,"INV-2026-DEMO-006",3,6,"Rental refresh final","PAID","2026-02-18","2026-03-04",13000,14300],
      [7,"INV-2026-DEMO-007",7,7,"Deck deposit","DRAFT","2026-08-18","2026-09-01",6000,0],
    ] as const;
    for (const [n, invoiceNumber, customer, project, title, status, issue, due, subtotal, paid] of invoices) {
      const total = subtotal * 1.1;
      await tx.invoice.create({
        data: {
          id: id(5, n), invoiceNumber, customerId: id(2, customer), projectId: id(3, project),
          title, status, issueDate: d(issue), dueDate: d(due), subtotal,
          gstAmount: subtotal * 0.1, totalAmount: total, amountPaid: paid,
          balanceDue: Math.max(total - paid, 0), ownerId: user.id,
          terms: "Payment due within 14 days.",
          items: { create: [{ description: title, quantity: 1, unitPrice: subtotal, lineTotal: subtotal, sortOrder: 0 }] },
          payments: paid > 0 ? { create: { id: id(6, n), amount: paid, method: "BANK_TRANSFER", reference: `DEMO-PAY-${n}`, paidAt: d(issue), ownerId: user.id } } : undefined,
        },
      });
    }

    const expenses = [
      [1,1,"Bathroom fixtures","Reece Plumbing","MATERIALS",4380,"PAID","2026-07-15"],[2,1,"Waterproofing supplies","Bunnings Mile End","MATERIALS",1260,"PAID","2026-07-18"],[3,2,"Kitchen cabinetry deposit","Adelaide Cabinets","MATERIALS",7200,"PAID","2026-06-20"],[4,2,"Electrical fittings","Middy’s","MATERIALS",1850,"PENDING","2026-08-02"],[5,3,"Tile adhesive and grout","Beaumont Tiles","MATERIALS",1640,"PAID","2026-08-07"],[6,4,"Premium tapware","Tradelink","MATERIALS",2900,"PAID","2026-04-11"],[7,5,"Commercial framing materials","Stratco","MATERIALS",9350,"PAID","2026-07-25"],[8,5,"Equipment hire","Kennards Hire","EQUIPMENT_HIRE",2180,"PAID","2026-08-03"],[9,6,"Paint and consumables","Inspirations Paint","MATERIALS",2200,"PAID","2026-01-18"],[10,7,"Spotted gum decking","Australian Timbers","MATERIALS",5100,"PENDING","2026-08-17"],
    ] as const;
    for(const [n,project,description,supplier,category,amount,status,expenseDate] of expenses) { const treatment=n===4?"UNKNOWN":n===9?"GST_FREE":"GST_INCLUDED";const claimable=treatment==="GST_INCLUDED";await tx.expense.create({data:{id:id(7,n),projectId:id(3,project),description,supplier,category,status,amount,gstAmount:claimable?Number((amount/11).toFixed(2)):0,gstTreatment:treatment,gstClaimable:claimable,expenseDate:d(expenseDate),dueDate:status==="PENDING"?d("2026-09-05"):null,paidAt:status==="PAID"?d(expenseDate):null,ownerId:user.id,receipts:n<=6&&n!==4?{create:{id:id(11,n),originalName:`demo-receipt-${n}.pdf`,fileName:`demo-receipt-${n}.pdf`,mimeType:"application/pdf",fileSize:24500,storagePath:`demo/demo-receipt-${n}.pdf`,ownerId:user.id}}:undefined}});}

    const subcontractors = [
      [1,"Ethan","Murphy","Murphy Tiling","43 812 345 678","0401 220 104"],[2,"Grace","Lee","Lee Electrical SA","67 923 456 789","0413 220 218"],[3,"Lucas","Harris","Harris Carpentry","25 134 567 890","0422 220 327"],[4,"Ruby","Thomas","RT Painting","81 245 678 901","0430 220 436"],[5,"Henry","Clark","Clark Plumbing Solutions","39 356 789 012","0409 220 545"],
    ] as const;
    for(const [n,firstName,lastName,businessName,abn,phone] of subcontractors) await tx.subcontractor.create({data:{id:id(8,n),firstName,lastName,businessName,abn,phone,email:`accounts@${businessName.toLowerCase().replaceAll(" ","")}.example`,ownerId:user.id}});

    const costs = [
      [1,1,1,"Wall and floor tiling","SQUARE_METRE",72,46,3312,3500,2000,"PARTIALLY_PAID"],[2,5,1,"Plumbing rough-in and fit-off","FIXED_TASK",null,null,null,4200,4200,"PAID"],[3,2,2,"Kitchen electrical upgrade","HOURLY",96,34,3264,3400,1500,"PARTIALLY_PAID"],[4,1,3,"Apartment floor tiling","SQUARE_METRE",68,132,8976,9200,0,"UNPAID"],[5,1,4,"Ensuite tiling","SQUARE_METRE",75,38,2850,3000,3000,"PAID"],[6,2,5,"Office electrical fitout","FIXED_PROJECT",null,null,null,12500,5000,"PARTIALLY_PAID"],[7,3,5,"Partition framing","DAILY",720,8,5760,6000,0,"UNPAID"],[8,4,6,"Interior repaint","FIXED_PROJECT",null,null,null,4800,4800,"PAID"],[9,3,7,"Deck construction labour","PER_UNIT",95,42,3990,4200,0,"UNPAID"],
    ] as const;
    for(const [n,subcontractor,project,description,rateType,rate,quantity,calculatedAmount,agreedAmount,amountPaid,status] of costs){await tx.subcontractorProjectCost.create({data:{id:id(9,n),subcontractorId:id(8,subcontractor),projectId:id(3,project),description,rateType,rate,quantity,calculatedAmount,agreedAmount,amountPaid,amountPending:agreedAmount-amountPaid,status,ownerId:user.id,payments:amountPaid>0?{create:{id:id(10,n),amount:amountPaid,paidAt:d("2026-08-10"),reference:`SUB-DEMO-${n}`,notes:"Demo bank transfer",ownerId:user.id}}:undefined}});}
    await tx.paygInstalment.createMany({data:[{id:id(12,1),ownerId:user.id,amount:1200,paidAt:d("2026-07-28"),period:"2026–27 Q1",reference:"PAYG-Q1"},{id:id(12,2),ownerId:user.id,amount:800,paidAt:d("2026-08-28"),period:"2026–27 Q1",reference:"PAYG-Q1-2"}]});
  }, { timeout: 30000 });

  console.log("Demo data ready", { user: user.email, customers: 7, projects: 8, invoices: 7, subcontractors: 5 });
}

main().catch((error: unknown) => { console.error("Seed failed:", error); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
