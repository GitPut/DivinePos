import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  FiChevronDown,
  FiChevronRight,
  FiMonitor,
  FiShoppingBag,
  FiBarChart2,
  FiSettings,
  FiFileText,
  FiGrid,
  FiUsers,
  FiClock,
  FiTruck,
  FiLayers,
  FiGlobe,
  FiDollarSign,
  FiTag,
  FiPackage,
  FiLayout,
} from "react-icons/fi";

interface FAQItem {
  question: string;
  answer: string;
}

interface HelpSection {
  id: string;
  icon: React.ReactNode;
  title: string;
  items: FAQItem[];
}

const helpData: Record<string, { title: string; subtitle: string; sections: HelpSection[] }> = {
  "1": {
    title: "Getting Started",
    subtitle: "Learn the basics of setting up and using Divine POS",
    sections: [
      {
        id: "first-steps",
        icon: <FiGrid size={18} color="#1D294E" />,
        title: "First Steps",
        items: [
          {
            question: "How do I set up my store?",
            answer: "After creating your account and choosing a plan, go to Settings → General Settings. Enter your store name, address, phone number, and tax rate. These details appear on receipts and your online store.",
          },
          {
            question: "How do I set a manager password?",
            answer: "Go to Settings → General Settings and scroll to the Manager Password section. This password is required to access the admin backend, apply discounts, cancel orders, and other sensitive actions. Employees with the right permissions can also use their PIN instead.",
          },
          {
            question: "How do I restart the setup walkthrough?",
            answer: "Click \"Walkthrough\" in the admin sidebar (below Help). This will restart the interactive guide that walks you through device setup, creating categories, adding products, and taking your first order.",
          },
        ],
      },
      {
        id: "device-setup",
        icon: <FiMonitor size={18} color="#06b6d4" />,
        title: "Device Setup",
        items: [
          {
            question: "How do I set up a device?",
            answer: "Go to Settings → Device Settings. Your current browser is automatically registered as a device. Give it a name (e.g. \"Front Register\") and click Save. Each browser/tablet you use becomes its own device.",
          },
          {
            question: "How do I connect a receipt printer?",
            answer: "1. Download and install the Divine POS Helper (QZ Tray) from the Device Settings page.\n2. Open the helper app — it runs in the background.\n3. In Device Settings, type your printer's name exactly as it appears in your computer's printer settings (e.g. \"EPSON TM-T20III\").\n4. Click Save. Your receipts will now print automatically when orders are placed.",
          },
          {
            question: "Can I print from a different device?",
            answer: "Yes! In Device Settings, enable \"Use Different Device to Print\" and select the device that has the printer connected. When you take an order on this device, the receipt will be sent to the other device's printer.",
          },
          {
            question: "How many devices can I use?",
            answer: "Free Trial and Starter plans include 1 device. Professional plan includes unlimited devices. You can manage all your devices from Settings → Device Settings.",
          },
        ],
      },
      {
        id: "navigation",
        icon: <FiLayout size={18} color="#8b5cf6" />,
        title: "Navigating the App",
        items: [
          {
            question: "How do I switch between POS and Admin?",
            answer: "Click the \"POS\" button in the top-right header to go to the Point of Sale screen. To access the admin panel, click the Settings icon in the POS sidebar, then enter your manager password.",
          },
          {
            question: "What's the Customer Display?",
            answer: "Click \"Customer Display\" in the header to open a second screen that shows the current order to your customer. It updates in real-time as you add items. This is great for a customer-facing monitor.",
          },
        ],
      },
    ],
  },
  "2": {
    title: "Device & Store Settings",
    subtitle: "Configure your store details, devices, and preferences",
    sections: [
      {
        id: "general",
        icon: <FiSettings size={18} color="#1D294E" />,
        title: "General Settings",
        items: [
          {
            question: "How do I change my store name, address, or phone?",
            answer: "Go to Settings → General Settings. Update any field and click Save. These details appear on receipts and your online store.",
          },
          {
            question: "How do I set my tax rate?",
            answer: "In General Settings, find the Tax Rate field and enter your rate as a number (e.g. \"13\" for 13%). This is applied automatically to all orders.",
          },
          {
            question: "How do I enable delivery?",
            answer: "In General Settings, turn on \"Accept Delivery\". Then set your delivery price and delivery range (in kilometers). When customers order delivery, the system checks if their address is within range using GPS coordinates.",
          },
          {
            question: "How do I set a delivery price?",
            answer: "In General Settings, enter the delivery fee in the Delivery Price field. This amount is added to delivery orders automatically.",
          },
        ],
      },
      {
        id: "devices",
        icon: <FiMonitor size={18} color="#06b6d4" />,
        title: "Device Settings",
        items: [
          {
            question: "How do I rename a device?",
            answer: "Go to Settings → Device Settings. The current device is shown at the top. Type a new name and click Save.",
          },
          {
            question: "What is the Divine POS Helper?",
            answer: "The Divine POS Helper (QZ Tray) is a small program that connects your browser to your receipt printer. Download it from Device Settings, install it, and it runs in the background. Without it, receipt printing won't work.",
          },
        ],
      },
      {
        id: "online-store",
        icon: <FiGlobe size={18} color="#10b981" />,
        title: "Online Store",
        items: [
          {
            question: "How do I set up my online store?",
            answer: "Go to Settings → Online Store. Enter your Stripe public and secret keys (for payment processing), then toggle the online store on. Your store URL will be: divinepos.com/order/[your-url-ending].",
          },
          {
            question: "How do I hide products from the online store?",
            answer: "When editing a product, toggle on \"Hide from Online Store\" in the Settings section. The product will still appear on your POS but won't show up for online customers.",
          },
          {
            question: "Do I need the Professional plan for online ordering?",
            answer: "Yes, the online store is included with the Professional plan ($69/month).",
          },
        ],
      },
      {
        id: "tables",
        icon: <FiLayout size={18} color="#8b5cf6" />,
        title: "Table Settings",
        items: [
          {
            question: "How do I set up tables?",
            answer: "Go to Settings → Table Settings (Professional plan required). Add sections (e.g. \"Patio\", \"Main Floor\") and then add tables with a name, number, seats, and shape. Tables appear in the POS floor view.",
          },
          {
            question: "How does table management work?",
            answer: "In the POS, click the Tables icon in the sidebar to see your floor plan. Click an empty table to open it (enter guests and server name). Items are automatically saved to the table. When the customer pays, click the table to complete or close the order.",
          },
          {
            question: "Can I send orders to the kitchen?",
            answer: "Yes! When a table has items, click \"Send Order\" to send only the new (unsent) items to the kitchen printer. Items already sent are marked and won't be sent again.",
          },
        ],
      },
      {
        id: "billing",
        icon: <FiDollarSign size={18} color="#f59e0b" />,
        title: "Billing",
        items: [
          {
            question: "What plans are available?",
            answer: "• Free Trial — 1 device, all basic features, 1 month free\n• Starter ($29/month) — 1 device, all basic features, we set up your store\n• Professional ($69/month) — Unlimited devices, online store, table management, WooCommerce integration",
          },
          {
            question: "How do I change my plan?",
            answer: "Go to Settings → Billing. You can switch between Starter and Professional, or manage your subscription through the Stripe customer portal.",
          },
        ],
      },
    ],
  },
  "3": {
    title: "Dashboard & Analytics",
    subtitle: "Understand your store's performance and sales data",
    sections: [
      {
        id: "dashboard",
        icon: <FiBarChart2 size={18} color="#1D294E" />,
        title: "Dashboard Overview",
        items: [
          {
            question: "What does the dashboard show?",
            answer: "The dashboard shows key performance metrics for your selected time period:\n• Total Revenue — Total sales amount\n• Total Orders — Number of orders placed\n• New Customers — Customers saved during this period\n• Average Wait Time — How long orders take\n\nBelow that you'll see a revenue chart, most ordered items, and breakdowns by order type (pickup, delivery, in-store).",
          },
          {
            question: "How do I change the time period?",
            answer: "Use the period dropdown in the top-right of the dashboard. Options: Today, This Week, This Month, This Year, or All Time.",
          },
          {
            question: "Where does the data come from?",
            answer: "Analytics are calculated from completed orders. Every time an order is finished (paid), it's added to your transaction list and the stats are updated automatically.",
          },
        ],
      },
    ],
  },
  "4": {
    title: "Building Products",
    subtitle: "Create and manage your menu items, categories, and options",
    sections: [
      {
        id: "categories",
        icon: <FiTag size={18} color="#ec4899" />,
        title: "Categories",
        items: [
          {
            question: "How do I create a category?",
            answer: "Go to Menu → Category Management and click \"Add Category\". Enter a name (e.g. \"Pizza\", \"Drinks\") and choose a position. Categories organize your products in the POS view.",
          },
          {
            question: "How do I reorder categories?",
            answer: "Drag and drop categories in the list to change their order. The order determines how they appear as filter tabs in the POS.",
          },
        ],
      },
      {
        id: "products",
        icon: <FiShoppingBag size={18} color="#f97316" />,
        title: "Products",
        items: [
          {
            question: "How do I add a product?",
            answer: "Go to Menu → Product Management and click \"Add Product\". Fill in the name, price, and category. You can also add an image, description, and display rank.",
          },
          {
            question: "How do I use product templates?",
            answer: "Click \"Templates\" in the Product Management header. Browse pre-built products (pizza, coffee, burgers, etc.) and click \"Use Template\". The product is added with all its options pre-configured — just customize the prices.",
          },
          {
            question: "What is the Display Order field?",
            answer: "Display Order (rank) controls the order products appear in the POS grid. Lower numbers appear first. Leave it blank for automatic ordering.",
          },
          {
            question: "How do I duplicate a product?",
            answer: "Open a product for editing and click \"Duplicate\" in the top bar. A copy is created with \" Copy\" appended to the name.",
          },
          {
            question: "How do I track inventory for a product?",
            answer: "When editing a product, toggle on \"Track Inventory\" in the Settings section. Choose \"Simple Count\" to track by quantity, or \"Recipe Based\" to track by ingredient usage. Set a low stock threshold to get alerts.",
          },
        ],
      },
      {
        id: "options",
        icon: <FiLayers size={18} color="#1D294E" />,
        title: "Product Options & Customizations",
        items: [
          {
            question: "What are product options?",
            answer: "Options let customers customize a product. For example, a pizza might have options for Size (Small/Medium/Large), Toppings (Pepperoni/Mushrooms), and Crust (Thin/Thick). Each choice can have its own price increase.",
          },
          {
            question: "What option types are available?",
            answer: "• Row — Buttons in a row (best for sizes, single choices)\n• Dropdown — Single-select dropdown menu\n• Quantity Dropdown — Multi-select with quantities (best for toppings)\n• Table View — Checkbox grid layout\n• Included Selections — \"Choose N free, extra cost after\" (e.g. \"3 toppings included, $1.50 each extra\")",
          },
          {
            question: "What are Option Templates?",
            answer: "Option Templates let you create an option once (like \"Sizes\" or \"Toppings\") and reuse it across multiple products. When you update a template, ALL products using it update automatically. Go to Menu → Option Templates to create them.",
          },
          {
            question: "How do I use Option Templates?",
            answer: "1. Go to Menu → Option Templates and create a template (e.g. \"Pizza Sizes\")\n2. When editing a product, click \"Add from Template\" in the options section\n3. Select the template — the option is added instantly\n4. Later, edit the template and all linked products update",
          },
          {
            question: "How do I set different prices by size?",
            answer: "In the option editor, go to Advanced Settings and set \"Link Prices To Another Option\" to your size option. Each choice will then show separate price fields for each size instead of a single price.",
          },
          {
            question: "How do I set all prices at once?",
            answer: "When editing an option with multiple choices, use the blue \"Set all prices\" box above the choices list. Enter a price for each size (or a single price) and click \"Apply to All\". This updates every choice at once.",
          },
          {
            question: "What are Visibility Rules?",
            answer: "Visibility Rules (in Advanced Settings) let you show or hide an option based on another option's value. For example: only show \"Steak Temperature\" when the customer selects \"Steak\" as their protein. Set \"When this option = [value]\" to create the rule.",
          },
          {
            question: "How do I make an option required?",
            answer: "Toggle the \"Required\" switch when editing the option. Customers must select a choice before adding the product to their cart.",
          },
        ],
      },
      {
        id: "inventory",
        icon: <FiPackage size={18} color="#10b981" />,
        title: "Inventory",
        items: [
          {
            question: "How does inventory tracking work?",
            answer: "When you enable \"Track Inventory\" on a product, the system deducts stock every time that product is sold. You can track by simple count (e.g. 50 units) or by recipe (e.g. uses 200g flour + 100g cheese per item).",
          },
          {
            question: "How do I manage ingredients?",
            answer: "Go to Inventory → Ingredients to add raw ingredients (flour, cheese, etc.) with units and stock levels. Then assign them to product recipes. When a product sells, ingredient stock is automatically deducted.",
          },
          {
            question: "How do I adjust stock manually?",
            answer: "Go to Inventory → Product Stock to see all tracked products. Click a product to adjust its stock up or down. Each adjustment is logged in the stock history.",
          },
        ],
      },
    ],
  },
  "5": {
    title: "Managing Reports",
    subtitle: "Track orders, employees, and business activity",
    sections: [
      {
        id: "invoices",
        icon: <FiFileText size={18} color="#1D294E" />,
        title: "Invoices & Transactions",
        items: [
          {
            question: "Where can I see past orders?",
            answer: "Go to Reports → Invoices. This shows all completed transactions with date, customer name, order type, total, and payment method. Use the search bar and date filters to find specific orders.",
          },
          {
            question: "Can I reprint a receipt?",
            answer: "Yes — click on any transaction in the Invoices list to view its details and reprint the receipt.",
          },
        ],
      },
      {
        id: "employees",
        icon: <FiUsers size={18} color="#8b5cf6" />,
        title: "Employees",
        items: [
          {
            question: "How do I add an employee?",
            answer: "Go to Reports → Employees and click \"Add Employee\". Enter their name and a PIN code. The PIN is used for clock-in/out and for authorizing actions like discounts.",
          },
          {
            question: "What permissions can I set?",
            answer: "Click an employee to edit their permissions:\n• Access Backend — Can access the admin panel\n• Discount — Can apply discounts to orders\n• Custom Payment — Can process custom cash payments\n• Manage Orders — Can cancel or modify pending orders",
          },
          {
            question: "How does clock-in work?",
            answer: "In the POS, click the Clock-In icon in the sidebar. Employees enter their PIN to clock in or out. Hours are automatically tracked and visible in the employee's detail page under Reports → Employees.",
          },
        ],
      },
      {
        id: "orders",
        icon: <FiClock size={18} color="#f59e0b" />,
        title: "Orders & Kitchen",
        items: [
          {
            question: "How do I view pending orders?",
            answer: "In the POS, click the Orders icon in the sidebar. This shows all pending orders (pickup, delivery, online, table orders). Click an order to view details, edit it, complete it, or cancel it.",
          },
          {
            question: "What is Kitchen View?",
            answer: "In the Pending Orders modal, click the expand/maximize icon in the top-right. This opens a full-screen kitchen display showing all pending orders as cards with items, notes, and elapsed time. Perfect for a kitchen monitor.",
          },
          {
            question: "How do I process a phone order?",
            answer: "In the POS, click the Delivery/Phone icon in the sidebar. Enter the customer's name and phone number. Toggle Delivery if needed and enter their address. Click \"Start Order\" to begin adding items to their order.",
          },
        ],
      },
      {
        id: "delivery",
        icon: <FiTruck size={18} color="#f97316" />,
        title: "Delivery",
        items: [
          {
            question: "How does delivery work?",
            answer: "Enable delivery in Settings → General Settings. Set a delivery price and range. When creating a phone order, toggle Delivery and enter the customer's address. The system checks if the address is within your delivery range using GPS distance calculation.",
          },
          {
            question: "Can I integrate with delivery platforms?",
            answer: "Yes (Professional plan). Divine POS supports DoorDash, UberEats, SkipTheDishes, and Grubhub webhooks. Orders from these platforms appear automatically in your pending orders and can auto-print receipts.",
          },
        ],
      },
      {
        id: "activity",
        icon: <FiFileText size={18} color="#64748b" />,
        title: "Activity Log",
        items: [
          {
            question: "What is the Activity Log?",
            answer: "Go to Reports → Activity Log to see a chronological record of employee actions: discounts applied, orders canceled, custom payments, backend access, and more. Each entry shows who did what and when.",
          },
        ],
      },
    ],
  },
};

function CollapsibleFAQ({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={styles.faqItem}>
      <button style={styles.faqQuestion} onClick={() => setOpen(!open)}>
        <span style={styles.faqQuestionText}>{item.question}</span>
        {open ? (
          <FiChevronDown size={16} color="#64748b" />
        ) : (
          <FiChevronRight size={16} color="#94a3b8" />
        )}
      </button>
      {open && (
        <div style={styles.faqAnswer}>
          <span style={styles.faqAnswerText}>{item.answer}</span>
        </div>
      )}
    </div>
  );
}

const HelpPage = () => {
  const location = useLocation();
  const pathParts = location.pathname.split("/");
  const pageId = pathParts[pathParts.length - 1] || "1";
  const page = helpData[pageId] || helpData["1"];

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <div>
          <span style={styles.title}>{page.title}</span>
          <span style={styles.subtitle}>{page.subtitle}</span>
        </div>
      </div>

      <div style={styles.scrollArea}>
        {page.sections.map((section) => (
          <div key={section.id} style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionIcon}>{section.icon}</div>
              <span style={styles.sectionTitle}>{section.title}</span>
            </div>
            <div style={styles.faqList}>
              {section.items.map((item, i) => (
                <CollapsibleFAQ key={i} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HelpPage;

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: 30,
    boxSizing: "border-box",
    overflow: "hidden",
  },
  headerRow: {
    marginBottom: 24,
    flexShrink: 0,
  },
  title: {
    fontWeight: "700",
    fontSize: 24,
    color: "#0f172a",
    display: "block",
  },
  subtitle: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "500",
    marginTop: 4,
    display: "block",
  },
  scrollArea: {
    flex: 1,
    overflow: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    paddingBottom: 20,
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    overflow: "hidden",
  },
  sectionHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: "16px 20px",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  faqList: {
    display: "flex",
    flexDirection: "column",
  },
  faqItem: {
    borderBottom: "1px solid #f1f5f9",
  },
  faqQuestion: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: "14px 20px",
    background: "none",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
    boxSizing: "border-box",
  },
  faqQuestionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    flex: 1,
    paddingRight: 12,
  },
  faqAnswer: {
    padding: "0 20px 16px",
  },
  faqAnswerText: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: "1.7",
    whiteSpace: "pre-line",
  },
};
