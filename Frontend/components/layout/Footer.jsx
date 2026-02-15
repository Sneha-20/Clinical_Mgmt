export const Footer = () => (
  <footer className="bg-foreground text-background py-8 px-6 text-center">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
      <p className="mb-4 md:mb-0 text-sm opacity-80">
        &copy; {new Date().getFullYear()} Navjeevan Operating Intelligence
        System (NOIS). All rights reserved.
      </p>
      <div className="flex space-x-6 text-sm">
        <a
          href="#"
          className="hover:text-secondary-light transition-colors duration-300"
        >
          Privacy Policy
        </a>
        <a
          href="#"
          className="hover:text-secondary-light transition-colors duration-300"
        >
          Terms of Service
        </a>
      </div>
    </div>
  </footer>
);
