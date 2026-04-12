import { Shield, RefreshCw, Truck, Lock } from 'lucide-react';

export default function Policy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Policies</h1>
        <p className="text-gray-600">Your trust is our priority. Learn about our shipping, refund, and privacy policies.</p>
      </div>

      <div className="space-y-12">
        <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              <RefreshCw size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Refund & Return Policy</h2>
          </div>
          <div className="prose prose-slate max-w-none text-gray-600 space-y-4">
            <p>
              We want you to be completely satisfied with your purchase. If you're not happy with your order, 
              you can return it within 30 days of delivery for a full refund or exchange.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Items must be in original packaging and unused condition.</li>
              <li>Proof of purchase is required for all returns.</li>
              <li>Refunds will be processed to the original payment method within 5-7 business days.</li>
              <li>Return shipping costs are covered by the customer unless the item is defective.</li>
            </ul>
          </div>
        </section>

        <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
              <Truck size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Shipping Policy</h2>
          </div>
          <div className="prose prose-blue max-w-none text-gray-600 space-y-4">
            <p>
              We offer worldwide shipping. Our dropshipping model allows us to source products directly from 
              manufacturers to give you the best prices.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Standard shipping takes 7-15 business days depending on your location.</li>
              <li>Order processing time is typically 1-3 business days.</li>
              <li>Tracking numbers are provided for all orders via email once shipped.</li>
              <li>Customs duties or import taxes are the responsibility of the customer.</li>
            </ul>
          </div>
        </section>

        <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <Shield size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Privacy Policy</h2>
          </div>
          <div className="prose prose-blue max-w-none text-gray-600 space-y-4">
            <p>
              We respect your privacy and are committed to protecting your personal data. 
              We only collect information necessary to process your orders and improve your shopping experience.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>We never sell your personal information to third parties.</li>
              <li>All payment transactions are processed through secure, encrypted gateways.</li>
              <li>You can request to have your data removed from our systems at any time.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
