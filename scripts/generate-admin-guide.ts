import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
  BorderStyle,
} from "docx";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const DIR = join(__dirname, "screenshots");

function img(filename: string, widthPx: number, heightPx: number) {
  const data = readFileSync(join(DIR, filename));
  // Scale images to fit page width (~600px max for DOCX at 72dpi)
  const scale = Math.min(1, 600 / widthPx);
  return new ImageRun({
    data,
    transformation: {
      width: Math.round(widthPx * scale),
      height: Math.round(heightPx * scale),
    },
    type: "png",
  });
}

function heading(text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel]) {
  return new Paragraph({ text, heading: level, spacing: { before: 300, after: 100 } });
}

function body(text: string) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, font: "Calibri" })],
    spacing: { after: 120 },
  });
}

function bold(text: string) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, font: "Calibri", bold: true })],
    spacing: { after: 80 },
  });
}

function bullet(text: string) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, font: "Calibri" })],
    bullet: { level: 0 },
    spacing: { after: 60 },
  });
}

function screenshot(filename: string, width: number, height: number, caption?: string) {
  const children: Paragraph[] = [
    new Paragraph({
      children: [img(filename, width, height)],
      spacing: { before: 200, after: 80 },
    }),
  ];
  if (caption) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: caption, size: 18, font: "Calibri", italics: true, color: "666666" })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
  }
  return children;
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function divider() {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" } },
    spacing: { before: 200, after: 200 },
  });
}

async function main() {
  const doc = new Document({
    styles: {
      default: {
        heading1: {
          run: { size: 36, bold: true, font: "Calibri", color: "1a1a2e" },
        },
        heading2: {
          run: { size: 28, bold: true, font: "Calibri", color: "2d2d44" },
        },
        heading3: {
          run: { size: 24, bold: true, font: "Calibri", color: "444444" },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1000, bottom: 1000, left: 1200, right: 1200 },
          },
        },
        children: [
          // ==================== TITLE PAGE ====================
          new Paragraph({ spacing: { before: 3000 } }),
          new Paragraph({
            children: [new TextRun({ text: "PURE PEPTIDES", size: 52, bold: true, font: "Calibri", color: "10b981" })],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [new TextRun({ text: "Admin Dashboard Guide", size: 36, font: "Calibri", color: "444444" })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "A step-by-step guide to managing your online store", size: 24, font: "Calibri", color: "888888" })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 1500 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `Prepared: April 2026`, size: 20, font: "Calibri", color: "AAAAAA" })],
            alignment: AlignmentType.CENTER,
          }),

          pageBreak(),

          // ==================== TABLE OF CONTENTS ====================
          heading("Contents", HeadingLevel.HEADING_1),
          body("1. Logging In"),
          body("2. Dashboard Overview"),
          body("3. Managing Products"),
          body("4. Managing Orders"),
          body("5. Customers"),
          body("6. Stock Management"),
          body("7. Shipping Settings"),
          body("8. Chatbot Settings"),

          pageBreak(),

          // ==================== 1. LOGGING IN ====================
          heading("1. Logging In", HeadingLevel.HEADING_1),
          body("To access the admin dashboard:"),
          bullet("Go to your website and click \"Login\" in the top menu."),
          bullet("Enter your admin email address and password."),
          bullet("Click \"Access System\" to log in."),
          bullet("Once logged in, click \"Admin\" in the top navigation menu to open the dashboard."),
          body("If you cannot see the \"Admin\" link after logging in, your account may not have admin permissions. Please contact your developer for assistance."),

          pageBreak(),

          // ==================== 2. DASHBOARD ====================
          heading("2. Dashboard Overview", HeadingLevel.HEADING_1),
          body("The Dashboard is your home screen. It gives you a quick snapshot of how your store is performing and what needs your attention."),
          ...screenshot("01-dashboard.png", 1280, 1040, "The Admin Dashboard"),

          heading("What you will see:", HeadingLevel.HEADING_2),

          bold("Action Required Banner (Yellow Bar)"),
          body("If there are new or paid orders that need your attention, a yellow banner will appear at the top. Click \"Review Orders\" to go straight to them."),

          bold("Quick Action Buttons"),
          bullet("+ Add Product — Create a new product listing."),
          bullet("Review Orders — Jump to the orders page."),
          bullet("Check Stock — See your current inventory levels."),

          bold("Revenue Cards"),
          body("Three cards showing your revenue in AED for Today, This Week, and This Month."),

          bold("Order Count Cards"),
          body("Three cards showing how many orders you have received Today, This Week, and This Month."),

          bold("Recent Orders Table"),
          body("A list of your most recent orders. Click any order to view its full details."),

          bold("Low Stock Alerts (Right Side)"),
          body("Products that are running low (fewer than 6 units) are shown here. Items in red are completely out of stock. Click \"Restock\" to add more inventory."),

          pageBreak(),

          // ==================== 3. PRODUCTS ====================
          heading("3. Managing Products", HeadingLevel.HEADING_1),

          heading("Viewing All Products", HeadingLevel.HEADING_2),
          body("Click \"Products\" in the left sidebar to see your full product catalogue."),
          ...screenshot("02-products.png", 1280, 1060, "The Products List"),
          body("From this screen you can:"),
          bullet("Search for products using the search box at the top."),
          bullet("See each product's compound code, category, number of variants, stock level, and whether it is featured."),
          bullet("Stock numbers are colour-coded: green means good stock, orange means getting low, and red means out of stock."),
          bullet("Click on any product row to edit it."),
          bullet("Click \"+ New Product\" (green button, top right) to create a new product."),

          pageBreak(),

          heading("Adding a New Product", HeadingLevel.HEADING_2),
          body("Click \"+ New Product\" to open the new product form. The form has three steps shown at the top: Product Details, Upload Image, and Add Variants."),
          ...screenshot("09-new-product.png", 1280, 1060, "The New Product Form"),

          bold("Step 1: Product Details"),
          body("Fill in the following fields:"),
          bullet("Product Name — The display name customers will see (e.g. \"BPC-157\")."),
          bullet("Slug — This is the web address for the product. It fills in automatically from the name."),
          bullet("Compound Code — Your internal reference code for the product."),
          bullet("Category — Choose a category from the dropdown list."),
          bullet("Short Description — A brief summary shown on product cards in the shop."),
          bullet("Long Description — A detailed description shown on the product's full page."),

          bold("Step 2: Scientific Details"),
          bullet("Purity (%) — The purity percentage, e.g. 99.5"),
          bullet("Molecular Weight — Weight in g/mol."),
          bullet("Form Factor — e.g. \"Lyophilized Powder\"."),
          bullet("Sequence — The amino acid sequence if applicable."),
          bullet("COA Batch Number — Certificate of Analysis reference."),

          bold("Step 3: Settings"),
          bullet("Featured Product — Tick this to highlight the product on the homepage."),
          bullet("Active (visible in store) — Untick this to hide the product from customers without deleting it."),

          body("Click \"Create Product\" when you are finished. You will then be taken to the image upload step."),

          pageBreak(),

          // ==================== 4. ORDERS ====================
          heading("4. Managing Orders", HeadingLevel.HEADING_1),

          heading("Viewing All Orders", HeadingLevel.HEADING_2),
          body("Click \"Orders\" in the left sidebar to see all customer orders."),
          ...screenshot("03-orders.png", 1280, 1060, "The Orders List"),
          body("From this screen you can:"),
          bullet("Filter orders by status using the buttons at the top (All, New, Processing, Paid, Confirmed, Shipped, etc.)."),
          bullet("Search for a specific order by order number, customer name, or email."),
          bullet("Click \"Export CSV\" to download all order data as a spreadsheet."),
          bullet("Click \"Check Payments\" to sync payment statuses with the payment provider."),
          bullet("Click any order row to view its full details."),

          pageBreak(),

          heading("Order Detail Page", HeadingLevel.HEADING_2),
          body("Click on any order to see its full details."),
          ...screenshot("04-order-detail.png", 1280, 1060, "Order Detail View"),

          body("This page shows everything about the order:"),
          bullet("Order Information — Order number, date, current status, subtotal, shipping cost, and total."),
          bullet("Payment Status — Live information from the payment gateway (Ziina), including whether payment has been completed."),
          bullet("Customer Information — Name, email, and phone number."),
          bullet("Shipping Address — The full delivery address."),
          bullet("Items — A table showing what the customer ordered, including product name, SKU, quantity, and price."),

          bold("Updating Order Status"),
          body("On the right side of the page, you will see the \"Update Status\" panel. To update an order:"),
          bullet("Choose the new status from the dropdown. Only valid next steps are shown (e.g. you cannot skip from \"New\" to \"Delivered\")."),
          bullet("If you are marking an order as \"Shipped\", you will see extra fields for the tracking number and tracking URL."),
          bullet("Add any internal notes in the Notes box (customers will not see these)."),
          bullet("Click \"Update Status\" to save."),

          body("When you mark an order as \"Shipped\", the customer will automatically receive an email notification with tracking details."),

          bold("Printing an Invoice"),
          body("Click the \"Print Invoice\" button at the top right of the order detail page to open a printable invoice."),

          pageBreak(),

          // ==================== 5. CUSTOMERS ====================
          heading("5. Customers", HeadingLevel.HEADING_1),
          body("Click \"Customers\" in the left sidebar to see a list of all registered customers."),
          ...screenshot("10-customers.png", 1280, 900, "The Customers List"),
          body("This page shows:"),
          bullet("Customer name and email address."),
          bullet("Their role (Customer or Admin)."),
          bullet("The date they registered."),
          body("This is a view-only page for your reference. Customer accounts are created when they register on the website."),

          pageBreak(),

          // ==================== 6. STOCK ====================
          heading("6. Stock Management", HeadingLevel.HEADING_1),

          heading("Viewing Stock Levels", HeadingLevel.HEADING_2),
          body("Click \"Stock\" in the left sidebar to see inventory levels for all product variants."),
          ...screenshot("05-stock.png", 1280, 900, "Stock Management"),
          body("At the top you will see summary cards:"),
          bullet("Total Variants — The total number of product variants in your catalogue."),
          bullet("Low Stock — How many variants have fewer than 6 units remaining."),
          body("The table below shows each variant with its current stock quantity. Stock numbers are colour-coded: green is healthy, orange is low, and red is out of stock. Each low-stock item has a \"Restock\" button."),

          heading("Restocking Inventory", HeadingLevel.HEADING_2),
          body("To add stock, either click a \"Restock\" button next to a variant, or go to Stock > Restock in the sidebar."),
          ...screenshot("06-restock.png", 1280, 900, "Restock Inventory Form"),
          body("To restock:"),
          bullet("Select Variant — Choose which product variant you want to restock from the dropdown."),
          bullet("Quantity to Add — Enter how many units you are adding."),
          bullet("Reason — Choose \"Restock\" (new delivery), \"Adjustment\" (stock count correction), or \"Return\" (customer returned item)."),
          bullet("Notes — Optionally add any notes about this restock (e.g. supplier name, delivery date)."),
          bullet("Click \"Confirm Restock\" to update the stock levels."),

          pageBreak(),

          // ==================== 7. SHIPPING ====================
          heading("7. Shipping Settings", HeadingLevel.HEADING_1),
          body("Click \"Shipping\" in the left sidebar to configure delivery rates."),
          ...screenshot("07-shipping.png", 1280, 960, "Shipping Settings"),

          bold("Rates by Emirate"),
          body("Set the shipping cost (in AED) for each emirate. Simply change the number next to each emirate name. For example, Dubai is set to 0 (free delivery) while other emirates have their own rates."),

          bold("Free Shipping Threshold"),
          body("At the bottom, set the minimum order amount (in AED) for free shipping. Orders above this amount will automatically get free delivery. Set it to 0 if you want all orders to have free shipping."),

          body("Click \"Save Shipping Settings\" when you are done making changes."),

          pageBreak(),

          // ==================== 8. CHATBOT ====================
          heading("8. Chatbot Settings", HeadingLevel.HEADING_1),
          body("Click \"Chatbot\" in the left sidebar to configure the AI research assistant that appears on your website."),
          ...screenshot("08-chatbot.png", 1280, 980, "Chatbot Settings"),

          bold("Enable / Disable"),
          body("Use the toggle switch at the top to turn the chatbot on or off. When disabled, customers will not see the chat icon on your website."),

          bold("Model"),
          body("Choose which AI model powers the chatbot. \"gpt-4o-mini\" is faster and cheaper for everyday questions. \"gpt-4o\" is more capable for complex queries."),

          bold("Greeting Message"),
          body("This is the first message customers see when they open the chat. Change it to whatever welcome message you prefer."),

          bold("System Prompt"),
          body("This tells the AI how to behave. You can customise what topics it covers and its tone. Safety guardrails (preventing medical/dosage advice) are built in and cannot be removed."),

          body("Click \"Save Settings\" after making any changes to the above."),

          bold("Knowledge Base"),
          body("Below the settings, you will see the Knowledge Base. These are pre-written Q&A pairs that the chatbot uses to answer common questions accurately."),
          bullet("Click \"+ Add\" to create a new Q&A entry."),
          bullet("Click \"Edit\" to modify an existing entry."),
          bullet("Click \"ON/OFF\" to enable or disable an entry without deleting it."),
          bullet("Click \"Del\" (red) to permanently delete an entry."),
          body("Each entry has a Question, an Answer, and an optional Category tag for organisation."),

          pageBreak(),

          // ==================== TIPS ====================
          heading("Quick Tips", HeadingLevel.HEADING_1),
          bullet("The left sidebar is your main navigation. Click any section name to go to that page."),
          bullet("Click \"Back to Store\" at the bottom of the sidebar to return to the customer-facing website."),
          bullet("Click \"Logout\" at the bottom of the sidebar to sign out."),
          bullet("The dashboard breadcrumbs at the top of each page (e.g. Dashboard / Orders / Detail) show where you are. You can click on any part to go back."),
          bullet("If you have any questions or run into issues, contact your developer for support."),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = join(__dirname, "..", "Pure_Peptides_Admin_Guide.docx");
  writeFileSync(outputPath, buffer);
  console.log(`Guide saved to: ${outputPath}`);
}

main().catch(console.error);
