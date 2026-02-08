"use client";

import { Button } from "@/components/ui/button";
import Companylogo from "@/public/icon/clinic-logo.png";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/utils/constants/route";

export const Header = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="bg-background shadow-md py-4 px-6 flex flex-wrap justify-between items-center fixed w-full top-0 z-50 border-b border-border">
      <div className="flex items-center justify-between w-full md:w-auto">
        <div
          className="flex items-center justify-center gap-2 mb-3 sm:mb-4"
          onClick={() => router.push(routes.pages.home)}
        >
          <div className=" flex items-center justify-center">
            <Image
              width={24}
              height={24}
              src={Companylogo}
              alt="compony logo"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">NOIS</h1>
        </div>

        <Button
          className="md:hidden text-primaryText p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          Clinic Login
        </Button>
      </div>

      <div className="hidden md:flex items-center space-x-8">
        <nav className="flex space-x-8">
          <a
            href="#home"
            className="text-foreground hover:text-primary transition-colors duration-300 font-medium whitespace-nowrap"
          >
            Home
          </a>
          <a
            href="#about"
            className="text-foreground hover:text-primary transition-colors duration-300 font-medium whitespace-nowrap"
          >
            About Us
          </a>
          <a
            href="#services"
            className="text-foreground hover:text-primary transition-colors duration-300 font-medium whitespace-nowrap"
          >
            Services
          </a>
          <a
            href="#team"
            className="text-foreground hover:text-primary transition-colors duration-300 font-medium whitespace-nowrap"
          >
            Our Team
          </a>
          <a
            href="#contact"
            className="text-foreground hover:text-primary transition-colors duration-300 font-medium whitespace-nowrap"
          >
            Contact Us
          </a>
        </nav>
        <Button
          className="w-full"
          onClick={() => router.push(routes.pages.login)}
        >
          Clinic Login
        </Button>
      </div>

      {isMenuOpen && (
        <nav className="md:hidden flex flex-col space-y-3 w-full mt-4 pb-4 border-t border-border pt-4">
          <a
            href="#home"
            onClick={closeMenu}
            className="text-foreground hover:text-primary transition-colors duration-300 font-medium px-2 py-2 rounded-md hover:bg-muted/50"
          >
            Home
          </a>
          <a
            href="#about"
            onClick={closeMenu}
            className="text-foreground hover:text-primary transition-colors duration-300 font-medium px-2 py-2 rounded-md hover:bg-muted/50"
          >
            About Us
          </a>
          <a
            href="#services"
            onClick={closeMenu}
            className="text-foreground hover:text-primary transition-colors duration-300 font-medium px-2 py-2 rounded-md hover:bg-muted/50"
          >
            Services
          </a>
          <a
            href="#team"
            onClick={closeMenu}
            className="text-foreground hover:text-primary transition-colors duration-300 font-medium px-2 py-2 rounded-md hover:bg-muted/50"
          >
            Our Team
          </a>
          <a
            href="#contact"
            onClick={closeMenu}
            className="text-foreground hover:text-primary transition-colors duration-300 font-medium px-2 py-2 rounded-md hover:bg-muted/50"
          >
            Contact Us
          </a>
          <button
            className="mt-4 bg-primary text-white py-2 px-5 rounded-md hover:bg-primary-foreground transition-colors duration-300 font-medium shadow-md w-full"
            onClick={() => {
              router.push(routes.pages.login);
              closeMenu();
            }}
          >
            Clinic Login
          </button>
        </nav>
      )}
    </header>
  );
};
