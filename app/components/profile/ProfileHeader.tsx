import Image from "next/image";
import { CakeIcon, PhoneIcon, MapPinIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import { Card } from "./Card";

export function ProfileHeader() {
  return (
    <Card>
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-gray-200 sm:h-24 sm:w-24">
          <Image
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=face"
            alt="Profile Picture"
            width={96}
            height={96}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1 pt-1">
          <h1 className="text-xl font-semibold sm:text-2xl">
            Alon Rom (He/Him)
          </h1>
          <p className="mt-0.5 text-sm text-tranquil-black">Product Manager</p>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-sm text-tranquil-black">
            <li className="flex items-center gap-2">
              <CakeIcon className="h-4 w-4 shrink-0 text-gray-400" />
              30-05-1990
            </li>
            <li className="flex items-center gap-2">
              <PhoneIcon className="h-4 w-4 shrink-0 text-gray-400" />
              +26 123645788
            </li>
            <li className="flex items-center gap-2">
              <MapPinIcon className="h-4 w-4 shrink-0 text-gray-400" />
              Testingville, USA
            </li>
            <li className="flex items-center gap-2">
              <EnvelopeIcon className="h-4 w-4 shrink-0 text-gray-400" />
              abc@gmail.com
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
