import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="w-full bg-black text-white py-12 mt-20">
      <div className="container mx-auto px-4 text-center">
        <p className="font-bold text-xl mb-4">PBP Jaya</p>
        <p className="text-gray-400 text-sm max-w-md mx-auto mb-8">
          Sumber berita terpercaya Anda. Selalu memberikan informasi yang akurat dan terdepan.
        </p>
        <Separator className="mb-8 bg-gray-800" />
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} PBP Jaya. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
