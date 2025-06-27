import Image from "next/image";

const features = [
  {
    title: "24/7 Tracking",
    img: "https://img.icons8.com/clouds/100/000000/gps-device.png",
  },
  {
    title: "Cash on Delivery",
    img: "https://img.icons8.com/clouds/100/000000/money.png",
  },
  {
    title: "Same Day Delivery",
    img: "https://img.icons8.com/fluency/96/delivery-scooter.png",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-30 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            CourierX - Fast. Reliable. Nationwide.
          </h1>
          <p className="text-lg sm:text-xl mb-8">
            Send and track parcels anywhere in Bangladesh with ease.
          </p>
          <a
            href="/customer/book-parcel"
            className="inline-block bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition"
          >
            Book a Delivery Now
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-gray-50 text-center">
        <h2 className="text-3xl font-semibold mb-10">Why Choose CourierX?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
            >
              <img
                src={feature.img}
                alt={feature.title}
                width={80}
                height={80}
                className="mx-auto mb-4"
              />
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
                euismod justo nec.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Booking Process */}
      <section className="py-16 px-6 text-center">
        <h2 className="text-3xl font-semibold mb-10">How It Works</h2>
        <div className="flex flex-col md:flex-row justify-center items-center gap-10 max-w-5xl mx-auto">
          {["Create Account", "Book Pickup", "Track Parcel"].map(
            (step, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-600 text-white flex items-center justify-center rounded-full text-lg font-bold mb-4">
                  {idx + 1}
                </div>
                <h4 className="text-lg font-semibold">{step}</h4>
                <p className="text-sm text-gray-600 max-w-xs mt-2">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                </p>
              </div>
            )
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-100 py-16 px-6">
        <h2 className="text-3xl font-semibold text-center mb-10">
          What Our Customers Say
        </h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Tariq Hossain",
              msg: "Amazing service! Fast and reliable.",
            },
            {
              name: "Rina Akter",
              msg: "Loved the tracking feature, very convenient.",
            },
            {
              name: "Kamrul Islam",
              msg: "Best courier experience I've had in Bangladesh!",
            },
          ].map((t, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow">
              <p className="italic text-gray-700 mb-4">&quot;{t.msg}&quot;</p>
              <div className="font-bold text-blue-600">{t.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-10 text-center">
        <div className="max-w-5xl mx-auto">
          <p className="mb-4 text-sm">© 2025 CourierX. All rights reserved.</p>
          <div className="flex justify-center gap-6 text-sm">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
