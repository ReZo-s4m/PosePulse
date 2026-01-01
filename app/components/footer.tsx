import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-10 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
        <div>
          <h2 className="text-xl font-bold">FRAME FIT</h2>
        </div>
        <div>
          <h3 className="font-semibold">Services</h3>
          <ul className="mt-2 space-y-1">
            <li className="hover:text-gray-400 transition-colors">AI-Powered Analysis</li>
            <li className="hover:text-gray-400 transition-colors">Posture Detection</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold">Resources</h3>
          <ul className="mt-2 space-y-1">
            <li><Link href="#" className="hover:text-gray-400 transition-colors">Open Source</Link></li>
            <li><Link href="#" className="hover:text-gray-400 transition-colors">Blog</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold">Company</h3>
          <ul className="mt-2 space-y-1">
            <li><Link href="#" className="hover:text-gray-400 transition-colors">About Us</Link></li>
            <li><Link href="#" className="hover:text-gray-400 transition-colors">Careers</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-6 text-xs flex justify-between border-t border-gray-700 pt-4">
        <p>&copy; 2025 Frame Fit. All rights reserved.</p>
        <div className="flex space-x-4">
          <Link href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-gray-400 transition-colors">Cookie Policy</Link>
          <Link href="#" className="hover:text-gray-400 transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
