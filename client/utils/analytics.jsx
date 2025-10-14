import ReactGA from "react-ga4";

// Initialize GA4
export const initGA = (userId) => {
  ReactGA.initialize("G-XXXXXXXXXX"); // Replace with your GA4 Measurement ID
  if (userId) {
    ReactGA.set({ user_id: userId }); // Send custom user info
  }
};

// Track page views
export const logPageView = (path) => {
  ReactGA.send({ hitType: "pageview", page: path });
};

// Track custom events
export const logEvent = (category, action, label, value) => {
  ReactGA.event({
    category, // e.g., "Invoice"
    action,   // e.g., "Generate"
    label,    // e.g., "Generate Invoice Button"
    value,    // optional numeric value
  });
};
