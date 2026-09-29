export interface PageRecord {
  id?: string;
  title: string;
  slug: string;
  content: string;
  isPublished?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const DEFAULT_PAGES_MAP: Record<string, PageRecord> = {
  "privacy-policy": {
    title: "Privacy Policy",
    slug: "privacy-policy",
    metaTitle: "Privacy Policy | Mora Moments",
    metaDescription: "Learn how Mora Moments collects, uses, and safeguards your personal data, gifting customizations, and payment information.",
    metaKeywords: "privacy policy, data protection, mora moments privacy, customer data security",
    content: `
      <p class="lead">At Mora Moments, we believe every gift is an expression of deep affection and trust. Protecting the privacy and security of your personal information, as well as that of your gift recipients, is foundational to our mission.</p>
      
      <h2>1. Introduction & Scope</h2>
      <p>This Privacy Policy outlines how Mora Moments ("we", "us", "our") collects, uses, stores, and protects information when you browse our website, customize gifts, make a purchase, or communicate with our customer support. We adhere to the Digital Personal Data Protection Act (DPDP), 2023, the Information Technology Act, 2000, and applicable Indian data privacy regulations.</p>

      <h2>2. Information We Collect</h2>
      <p>To provide a delightful and personalized gifting experience, we collect the following categories of information:</p>
      <ul>
        <li><strong>Account & Contact Information:</strong> Your name, phone number, email address, and billing address.</li>
        <li><strong>Recipient Information:</strong> The recipient's name, shipping address, contact phone number, and optional customized message cards. We only use recipient details to fulfill delivery.</li>
        <li><strong>Custom Media for Personalization:</strong> Photos, engravings, video links, or audio clips uploaded for custom gift hampers and personalized apparel.</li>
        <li><strong>Payment & Transaction Details:</strong> Order totals, transaction timestamps, and payment status. All financial payments are securely handled through PCI-DSS Level 1 compliant payment gateways (such as Razorpay). Mora Moments never stores your debit/credit card numbers or CVV.</li>
        <li><strong>Technical & Browsing Data:</strong> IP address, device type, browser version, and session cookies used to maintain your shopping cart and preferences.</li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <p>Your data is used solely to provide and elevate your gifting journey:</p>
      <ul>
        <li>Processing, assembling, and shipping your gift hampers and orders.</li>
        <li>Sending order confirmations, tracking alerts, and delivery confirmations via SMS, WhatsApp, and email.</li>
        <li>Providing dedicated customer assistance and resolving delivery inquiries.</li>
        <li>Preventing fraudulent transactions and ensuring website security.</li>
        <li>With your explicit permission, notifying you about seasonal collections and curated gifting inspiration.</li>
      </ul>

      <h2>4. Information Sharing & Disclosure</h2>
      <p>We do not sell, rent, or trade your personal data to third-party advertisers. We share information only with trusted service partners strictly necessary for operations:</p>
      <ul>
        <li><strong>Logistics Partners:</strong> Reliable national couriers (e.g., Blue Dart, Delhivery) strictly to transport and deliver your packages.</li>
        <li><strong>Cloud Infrastructure & Media Processing:</strong> Secure cloud servers (Cloudinary, AWS) to render high-resolution photos and videos for personalized keepsakes.</li>
        <li><strong>Legal Compliance:</strong> When required by lawful government requests or court orders under Indian jurisdiction.</li>
      </ul>

      <h2>5. Retention & Data Security</h2>
      <p>We employ 256-bit SSL encryption across our entire application, strict firewall policies, and regular security audits. Custom media uploaded for personalization (such as printed family photos) is stored securely and accessed only by authorized production craftsmen during order assembly.</p>

      <h2>6. Your Rights & Choices</h2>
      <p>You maintain complete control over your personal information:</p>
      <ul>
        <li><strong>Access & Correction:</strong> You can view and edit your profile details at any time through your <a href="/account">Account Dashboard</a>.</li>
        <li><strong>Data Deletion:</strong> You may request the deletion of your account and uploaded personalization media by writing to our support team.</li>
        <li><strong>Marketing Preferences:</strong> You can opt out of promotional messages at any time using the unsubscribe link in our emails or by contacting us.</li>
      </ul>

      <h2>7. Grievance Redressal</h2>
      <p>In accordance with the Information Technology Act and rules made thereunder, if you have any questions, concerns, or grievances regarding our privacy practices, please contact our Grievance Officer:</p>
      <p><strong>Grievance Officer:</strong> Privacy & Compliance Desk<br/>
      <strong>Email:</strong> <a href="mailto:privacy@moramoments.in">privacy@moramoments.in</a><br/>
      <strong>Support Desk:</strong> <a href="mailto:care@moramoments.in">care@moramoments.in</a><br/>
      <strong>Operating Hours:</strong> Monday – Saturday, 10:00 AM – 7:00 PM IST</p>
    `
  },
  "terms-and-conditions": {
    title: "Terms & Conditions",
    slug: "terms-and-conditions",
    metaTitle: "Terms & Conditions | Mora Moments",
    metaDescription: "Read the terms, conditions, and guidelines governing the use of the Mora Moments website, custom gift orders, and services.",
    metaKeywords: "terms and conditions, terms of service, mora moments terms, user agreement",
    content: `
      <p class="lead">Welcome to Mora Moments. By accessing or using our website, ordering handcrafted hampers, or engaging with our personalized gifting services, you agree to be bound by these Terms and Conditions.</p>

      <h2>1. General Overview</h2>
      <p>These terms govern your purchase of goods and access to the services provided by Mora Moments throughout India. If you do not agree to all terms, you may not access our services.</p>

      <h2>2. Eligibility & Account Security</h2>
      <p>By using our service, you represent that you are at least 18 years of age or accessing under the supervision of a parent or legal guardian. You are responsible for maintaining the confidentiality of your account credentials.</p>

      <h2>3. Pricing & Product Descriptions</h2>
      <p>All prices listed on Mora Moments are in Indian National Rupees (₹ INR) and include applicable taxes unless specified otherwise. While we strive for absolute accuracy in color representation, handcrafted items and photographic lighting may result in minor pleasant variations in natural materials.</p>

      <h2>4. Custom & Personalized Items</h2>
      <p>For custom items (e.g., engraved items, photo gifts, custom embroidered apparel):</p>
      <ul>
        <li>You warrant that you hold all necessary rights and permissions for images, text, and artwork submitted.</li>
        <li>You agree not to upload content that is defamatory, offensive, infringing, or illegal under Indian law.</li>
        <li>Once personalization has entered production, modifications or cancellations are not permitted.</li>
      </ul>

      <h2>5. Governing Law</h2>
      <p>These terms are governed by and construed in accordance with the laws of India. Any disputes arising shall be subject to the exclusive jurisdiction of the competent courts in India.</p>
    `
  },
  "shipping-policy": {
    title: "Shipping & Delivery Policy",
    slug: "shipping-policy",
    metaTitle: "Shipping & Delivery Policy | Mora Moments",
    metaDescription: "Information on our pan-India delivery timelines, packaging safety, standard dispatch, and order tracking.",
    metaKeywords: "shipping policy, delivery timelines, pan india gift delivery, mora moments shipping",
    content: `
      <p class="lead">We understand how important it is for your surprise to arrive on time and in pristine presentation. Here is everything you need to know about our shipping and handling process.</p>

      <h2>1. Serviceable Locations</h2>
      <p>Mora Moments delivers across 19,000+ serviceable pin codes throughout India through tier-1 courier partners including Blue Dart, Delhivery, and DTDC.</p>

      <h2>2. Dispatch & Preparation Times</h2>
      <ul>
        <li><strong>Curated & Ready-to-Ship Hampers:</strong> Dispatched within 24 to 48 hours of order confirmation.</li>
        <li><strong>Personalized & Custom Crafted Items:</strong> Dispatched within 2 to 4 business days to allow artisanal engraving, embroidery, or customized packaging.</li>
      </ul>

      <h2>3. Estimated Delivery Timelines</h2>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Destination Region</th>
              <th>Estimated Transit Time</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Metro Cities (Delhi NCR, Mumbai, Bengaluru, Kolkata, Chennai, Hyderabad)</td>
              <td>2 – 4 Business Days</td>
            </tr>
            <tr>
              <td>Tier 2 & Tier 3 Cities</td>
              <td>3 – 6 Business Days</td>
            </tr>
            <tr>
              <td>Special Regions & Remote Locations</td>
              <td>5 – 8 Business Days</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>4. Order Tracking</h2>
      <p>As soon as your package leaves our facility, you will receive an SMS and WhatsApp update with your live tracking number. You can also monitor real-time updates directly on our <a href="/track-order">Track Order</a> page.</p>

      <h2>5. Safe Transit Guarantee</h2>
      <p>Each Mora Moments gift box is protected with shock-absorbent eco-friendly cushioning and external water-resistant carton sealing to ensure your gift reaches its recipient in celebratory condition.</p>
    `
  },
  "refund-policy": {
    title: "Refund & Cancellation Policy",
    slug: "refund-policy",
    metaTitle: "Refund & Cancellation Policy | Mora Moments",
    metaDescription: "Our policy regarding order cancellations, damaged gift replacements, return procedures, and refund timelines.",
    metaKeywords: "refund policy, return policy, cancellation policy, mora moments refunds",
    content: `
      <p class="lead">Your complete satisfaction is our highest priority. If something is not quite right with your delivery, we are committed to making it right immediately.</p>

      <h2>1. Order Cancellations</h2>
      <ul>
        <li><strong>Standard Orders:</strong> Can be cancelled within 2 hours of placement or prior to dispatch, whichever is earlier.</li>
        <li><strong>Personalized Gifts:</strong> Once production or custom printing has begun, personalized orders cannot be cancelled.</li>
      </ul>

      <h2>2. Damaged or Defective Items</h2>
      <p>If your package arrives damaged in transit or defective, please contact us within <strong>48 hours of delivery</strong>:</p>
      <ul>
        <li>Please share photos or a brief unboxing video showing the damaged item and courier label to <a href="mailto:care@moramoments.in">care@moramoments.in</a> or via our WhatsApp support.</li>
        <li>We will promptly dispatch a <strong>complimentary express replacement</strong> or initiate a full refund as per your preference.</li>
      </ul>

      <h2>3. Refund Processing & Timelines</h2>
      <p>Approved refunds are initiated immediately and credited to your original payment method (Bank Account, UPI, Credit/Debit Card) via Razorpay within <strong>5 to 7 business days</strong>.</p>
    `
  },
  "about-us": {
    title: "About Us",
    slug: "about-us",
    metaTitle: "About Us | Mora Moments",
    metaDescription: "Discover the story behind Mora Moments — crafting thoughtful gift hampers, custom keepsakes, and unforgettable celebrations in India.",
    metaKeywords: "about mora moments, our story, bespoke gifts india, luxury hampers",
    content: `
      <p class="lead">Mora Moments was born out of a simple belief: the best gifts are not just items in a box, but tangible expressions of thoughtfulness, warmth, and shared memories.</p>

      <h2>The Art of Thoughtful Gifting</h2>
      <p>Whether celebrating an anniversary, welcoming a new milestone, or sending love across miles, we curate high-quality artisanal keepsakes, premium delicacies, and personal touches designed to delight from the very moment the ribbon is untied.</p>

      <h2>Our Core Values</h2>
      <ul>
        <li><strong>Artisanal Craftsmanship:</strong> We partner with skilled Indian makers and designers to produce bespoke items made with precision.</li>
        <li><strong>Uncompromising Presentation:</strong> From our signature gift boxes to handwritten calligraphy cards, every detail is treated with reverence.</li>
        <li><strong>Customer Happiness:</strong> We treat your celebrations as our own, ensuring seamless ordering, timely delivery, and dependable support.</li>
      </ul>
    `
  },
  "contact-us": {
    title: "Contact Us",
    slug: "contact-us",
    metaTitle: "Contact Us | Mora Moments",
    metaDescription: "Get in touch with Mora Moments customer care, order support, corporate gifting team, and bulk inquiries.",
    metaKeywords: "contact mora moments, customer care, support email, phone number, corporate gifts",
    content: `
      <p class="lead">Have a question about a personalized gift, tracking your shipment, or planning a bulk celebration? Our customer delight team is delighted to assist you.</p>

      <h2>Customer Support</h2>
      <p><strong>Email:</strong> <a href="mailto:care@moramoments.in">care@moramoments.in</a><br/>
      <strong>Hours:</strong> Monday to Saturday, 10:00 AM to 7:00 PM IST<br/>
      <strong>Response Time:</strong> Within 2 to 4 business hours</p>

      <h2>Corporate & Bespoke Gifting</h2>
      <p>Planning festive hampers, employee appreciation bundles, or client gifting? Visit our <a href="/corporate">Corporate Gifting Desk</a> or email <a href="mailto:corporate@moramoments.in">corporate@moramoments.in</a> for custom branding, bulk pricing, and dedicated relationship management.</p>
    `
  }
};
