import type { JSX, ReactNode } from "react";
import { HiOutlineLightningBolt as LightningIcon } from "react-icons/hi";

interface SectionProps {
  title: string;
  children: ReactNode;
}

export function Section({ title, children }: SectionProps): JSX.Element {
  return (
    <div className="flex relative pb-12">
      <div className="h-full w-10 absolute inset-0 flex items-center justify-center">
        <div className="h-full w-1 bg-base-300 pointer-events-none" />
      </div>
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary inline-flex items-center justify-center text-primary-content relative z-10">
        <LightningIcon className="w-5 h-5" />
      </div>

      <div className="flex-grow pl-4">
        <h2 className="font-medium title-font text-sm text-base-content mb-1 tracking-wider">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
