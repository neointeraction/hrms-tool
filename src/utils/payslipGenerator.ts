import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import payslipLogo from "../assets/payslip-logo.png";

// Helper to convert image URL to Base64 for jsPDF
const getBase64FromUrl = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute("crossOrigin", "anonymous");
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL("image/png");
      resolve(dataURL);
    };
    img.onerror = (error) => reject(error);
    img.src = url;
  });
};

// Helper to convert number to words (Simplified version)
const toWords = (amount: number) => {
  return "Rupees " + amount.toLocaleString() + " Only";
};

export const generatePayslipPDF = async (slip: any, user: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // --- Header Section ---
  // Logo (Image)
  try {
    const logoData = await getBase64FromUrl(payslipLogo);
    doc.addImage(logoData, "PNG", 15, 15, 60, 15); // Adjust dimensions as needed
  } catch (error) {
    console.error("Error loading logo", error);
    // Fallback text if logo fails
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("neointeraction", 23, 20);
  }

  // Company Name & Address
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Neointeraction Design", 15, 35);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("# M-98, 2nd Floor, LIC Housing", 15, 40);
  doc.text("Colony, HAL 3rd Stage, Jeevan Bima", 15, 44);
  doc.text("Nagar, Bengaluru, Karnataka 560075", 15, 48);

  doc.setTextColor(41, 128, 185); // Blue for link
  doc.text("Phone: +91- 9513338744", 15, 56);
  doc.text("Email: info@neointeraction.com", 15, 61);

  // PAYSLIP Title
  doc.setFontSize(14);
  doc.setTextColor(192, 57, 43); // Red
  doc.setFont("helvetica", "bold");
  doc.text("PAYSLIP", pageWidth / 2, 35, { align: "center" });

  // --- Grey Bar (Period Info) ---
  const startY = 70;
  doc.setFillColor(100, 100, 100); // Dark Grey
  doc.rect(85, startY, pageWidth - 100, 15, "F"); // Header Bar background

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");

  // Column headers in grey bar
  doc.text("PAY DATE", 95, startY + 5);
  doc.text("PERIOD", 135, startY + 5);
  doc.text("ISSUED ON", 175, startY + 5);

  // Values below grey bar
  doc.setFillColor(230, 230, 230); // Light Grey
  doc.rect(85, startY + 7, pageWidth - 100, 8, "F");

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  const payDateStr = slip.paymentDate
    ? new Date(slip.paymentDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      })
    : "N/A";
  doc.text(payDateStr, 95, startY + 12); // Placeholder/Actual Pay Date
  doc.text(`${slip.month} ${slip.year}`, 135, startY + 12);
  doc.text(new Date().toLocaleDateString(), 175, startY + 12);

  // --- Employee Information ---
  doc.setFillColor(100, 100, 100);
  doc.rect(15, startY + 20, pageWidth - 30, 7, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text("EMPLOYEE INFORMATION", pageWidth / 2, startY + 25, {
    align: "center",
  });

  // Info Grid
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);

  const infoY = startY + 35;
  const col1 = 15;
  const col2 = 60;
  const col3 = 110;
  const col4 = 150;
  const lineHeight = 6;

  // Left Column
  doc.setFont("helvetica", "normal");
  doc.text("Employee Name", col1, infoY);
  doc.setFont("helvetica", "bold");
  doc.text(user?.name || "N/A", col2, infoY);

  doc.setFont("helvetica", "normal");
  doc.text("Employee ID", col1, infoY + lineHeight);
  doc.setFont("helvetica", "bold");
  doc.text(user?.employeeId || "N/A", col2, infoY + lineHeight);

  doc.setFont("helvetica", "normal");
  doc.text("Designation", col1, infoY + lineHeight * 2);
  doc.setFont("helvetica", "bold");
  doc.text(
    slip?.employee?.designation || user?.designation || "N/A",
    col2,
    infoY + lineHeight * 2
  );

  doc.setFont("helvetica", "normal");
  doc.text("Department", col1, infoY + lineHeight * 3);
  doc.setFont("helvetica", "bold");
  doc.text(
    slip?.employee?.department || user?.department || "N/A",
    col2,
    infoY + lineHeight * 3
  );

  doc.setFont("helvetica", "normal");
  doc.text("Project Location", col1, infoY + lineHeight * 4);
  doc.setFont("helvetica", "bold");
  doc.text(
    slip?.employee?.location || user?.location || "N/A",
    col2,
    infoY + lineHeight * 4
  );

  // Right Column
  doc.setFont("helvetica", "normal");
  doc.text("Email", col3, infoY);
  doc.setFont("helvetica", "bold");
  doc.text(user?.email || "N/A", col4, infoY);

  doc.setFont("helvetica", "normal");
  doc.text("DOJ", col3, infoY + lineHeight);
  doc.setFont("helvetica", "bold");
  const rawDOJ = slip?.employee?.dateOfJoining || user?.doj;
  const dojStr = rawDOJ ? new Date(rawDOJ).toLocaleDateString() : "N/A";
  doc.text(dojStr, col4, infoY + lineHeight);

  doc.setFont("helvetica", "normal");
  doc.text("PAN", col3, infoY + lineHeight * 2);
  doc.setFont("helvetica", "bold");
  doc.text(
    slip?.employee?.pan || user?.pan || "N/A",
    col4,
    infoY + lineHeight * 2
  );

  doc.setFont("helvetica", "normal");
  doc.text("Bank Name", col3, infoY + lineHeight * 3);
  doc.setFont("helvetica", "bold");
  doc.text(
    slip?.employee?.bankDetails?.bankName ||
      user?.bankDetails?.bankName ||
      "N/A",
    col4,
    infoY + lineHeight * 3
  );

  doc.setFont("helvetica", "normal");
  doc.text("Bank Account No", col3, infoY + lineHeight * 4);
  doc.setFont("helvetica", "bold");
  doc.text(
    slip?.employee?.bankDetails?.accountNumber ||
      user?.bankDetails?.accountNumber ||
      "N/A",
    col4,
    infoY + lineHeight * 4
  );

  // --- Earnings Table ---
  let finalY = infoY + lineHeight * 6;

  // Build dynamic earnings rows
  const earningsRows: any[] = [
    ["Basic Pay", slip.basicPay.toFixed(2)],
    ["House Rent Allowance", slip.hra.toFixed(2)],
  ];

  // Add dynamic allowances from salary structure
  if (slip.allowances && Array.isArray(slip.allowances)) {
    slip.allowances.forEach((allowance: any) => {
      earningsRows.push([allowance.name, allowance.amount.toFixed(2)]);
    });
  }

  // Add Gross Earnings total row
  earningsRows.push([
    { content: "Gross Earnings", styles: { fontStyle: "bold" } },
    {
      content: slip.grossSalary.toFixed(2),
      styles: { fontStyle: "bold" },
    },
  ]);

  autoTable(doc, {
    startY: finalY,
    head: [["Earnings", "Amount INR"]],
    body: earningsRows,
    theme: "plain",
    headStyles: {
      fillColor: [220, 220, 220],
      textColor: 0,
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 2,
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { cellWidth: 130 },
      1: { cellWidth: 50, halign: "right" }, // Align amount right
    },
    margin: { left: 15, right: 15 },
  });

  // @ts-ignore
  finalY = doc.lastAutoTable.finalY + 5; // Reduced gap

  // --- Deductions Table ---
  // Dynamic Deductions Rows
  const deductionRows = (slip.deductions || []).map((d: any) => [
    d.name,
    d.amount.toFixed(2),
    "0.00", // YTD Placeholder - Backend support needed for real YTD
  ]);

  // Add Total Row
  deductionRows.push([
    { content: "TOTAL DEDUCTIONS", styles: { fontStyle: "bold" } },
    {
      content: slip.totalDeductions.toFixed(2),
      styles: { fontStyle: "bold" },
    },
    { content: "0.00", styles: { fontStyle: "bold" } }, // YTD Total Placeholder
  ]);

  autoTable(doc, {
    startY: finalY,
    head: [["DEDUCTIONS", "CURRENT", "YTD"]],
    body: deductionRows,
    theme: "plain",
    headStyles: {
      fillColor: [200, 200, 200],
      textColor: 0,
      fontStyle: "bold",
    }, // Darker grey for deductions header
    styles: {
      fontSize: 9,
      cellPadding: 2,
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { cellWidth: 90 }, // Adjusted to allow other columns to fit nicely if needed, or stick to sum 180
      1: { cellWidth: 45, halign: "right" },
      2: { cellWidth: 45, halign: "right" },
    },
    margin: { left: 15, right: 15 },
  });

  // @ts-ignore
  finalY = doc.lastAutoTable.finalY + 5; // Reduced gap

  // --- Net Pay ---
  autoTable(doc, {
    startY: finalY,
    body: [
      [
        {
          content: "Net Pay",
          styles: { halign: "right", fontStyle: "bold" },
        },
        {
          content: `Rs ${slip.netSalary.toFixed(2)}`,
          styles: { halign: "left", fontStyle: "bold" },
        },
      ],
      [
        {
          content: toWords(slip.netSalary),
          colSpan: 2,
          styles: { halign: "center", fontStyle: "italic", fontSize: 9 },
        },
      ],
    ],
    theme: "plain",
    styles: {
      cellPadding: 3,
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
      fillColor: [245, 245, 245],
    }, // Added light grey bg for visibility
    columnStyles: {
      0: { cellWidth: 130 }, // Matches Earnings Description + gap
      1: { cellWidth: 50 }, // Matches Earnings Amount
    },
    margin: { left: 15, right: 15 },
  });

  // Save
  doc.save(
    `Payslip_${slip.month}_${slip.year}_${user?.name?.split(" ")[0]}.pdf`
  );
};
