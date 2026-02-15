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
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);

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
        <nav className="flex space-x-8 items-center">
          <a
            href="/"
            className="text-foreground hover:text-primary transition-colors duration-300 font-medium whitespace-nowrap"
          >
            Home
          </a>
          <a
            href="/about"
            className="text-foreground hover:text-primary transition-colors duration-300 font-medium whitespace-nowrap"
          >
            About
          </a>
          
          {/* Services Dropdown */}
          <div className="relative group">
            <button className="text-foreground hover:text-primary transition-colors duration-300 font-medium whitespace-nowrap flex items-center gap-1">
              Services
              <span className="text-xs">▼</span>
            </button>
            <div className="absolute left-0 mt-0 w-48 bg-card border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-300 z-50">
              <a
                href="/services/audiology"
                className="block px-4 py-3 text-foreground hover:text-primary hover:bg-muted/50 transition-colors duration-300 first:rounded-t-lg"
              >
                🔊 Audiology Services
              </a>
              <a
                href="/services/speech"
                className="block px-4 py-3 text-foreground hover:text-primary hover:bg-muted/50 transition-colors duration-300 last:rounded-b-lg border-t border-border"
              >
                🎤 Speech Therapy
              </a>
            </div>
          </div>

          <a
            href="/appointment"
            className="text-foreground hover:text-primary transition-colors duration-300 font-medium whitespace-nowrap"
          >
            Appointment
          </a>
          <a
            href="/offers"
            className="text-foreground hover:text-primary transition-colors duration-300 font-medium whitespace-nowrap"
          >
            Offers
          </a>
          <a
            href="#contact"
            className="text-foreground hover:text-primary transition-colors duration-300 font-medium whitespace-nowrap"
          >
            Contact
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
            href="/"
            onClick={closeMenu}
            className="text-foreground hover:text-primary transition-colors duration-300 font-medium px-2 py-2 rounded-md hover:bg-muted/50"
          >
            Home
          </a>
          <a
            href="/about"
            onClick={closeMenu}
            className="text-foreground hover:text-primary transition-colors duration-300 font-medium px-2 py-2 rounded-md hover:bg-muted/50"
          >
            About
          </a>
          
          {/* Mobile Services Dropdown */}
          <div>
            <button
              onClick={() => setIsServicesDropdownOpen(!isServicesDropdownOpen)}
              className="text-foreground hover:text-primary transition-colors duration-300 font-medium px-2 py-2 rounded-md hover:bg-muted/50 w-full text-left flex items-center justify-between"
            >
              Services
              <span className={`text-xs transition-transform ${isServicesDropdownOpen ? "rotate-180" : ""}`}>
                ▼
              </span>
            </button>
            {isServicesDropdownOpen && (
              <div className="ml-4 mt-2 space-y-2 border-l-2 border-primary pl-4">
                <a
                  href="/services/audiology"
                  onClick={closeMenu}
                  className="text-foreground hover:text-primary transition-colors duration-300 font-medium block px-2 py-2 rounded-md hover:bg-muted/50"
                >
                  🔊 Audiology Services
                </a>
                <a
                  href="/services/speech"
                  onClick={closeMenu}
                  className="text-foreground hover:text-primary transition-colors duration-300 font-medium block px-2 py-2 rounded-md hover:bg-muted/50"
                >
                  🎤 Speech Therapy
                </a>
              </div>
            )}
          </div>

          <a
            href="/appointment"
            onClick={closeMenu}
            className="text-foreground hover:text-primary transition-colors duration-300 font-medium px-2 py-2 rounded-md hover:bg-muted/50"
          >
            Appointment
          </a>
          <a
            href="/offers"
            onClick={closeMenu}
            className="text-foreground hover:text-primary transition-colors duration-300 font-medium px-2 py-2 rounded-md hover:bg-muted/50"
          >
            Offers
          </a>
          <a
            href="#contact"
            onClick={closeMenu}
            className="text-foreground hover:text-primary transition-colors duration-300 font-medium px-2 py-2 rounded-md hover:bg-muted/50"
          >
            Contact
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
