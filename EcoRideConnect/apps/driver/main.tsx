import { createRoot } from "react-dom/client";
import DriverApp from "./src/DriverApp";
import "../../client/src/index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

try {
  const root = createRoot(rootElement);
  root.render(<DriverApp />);
} catch (error) {
  console.error('Failed to render app:', error);
  const errorDiv = document.getElementById('app-error');
  if (errorDiv) {
    errorDiv.textContent = `Failed to load app: ${error instanceof Error ? error.message : 'Unknown error'}`;
    errorDiv.style.display = 'block';
  }
  rootElement.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;height:100vh;padding:20px;text-align:center;font-family:system-ui,-apple-system,sans-serif">
      <div>
        <h1 style="color:#dc2626;margin-bottom:10px">Failed to Load Application</h1>
        <p>${error instanceof Error ? error.message : 'Unknown error occurred'}</p>
        <button onclick="window.location.reload()" style="margin-top:20px;padding:10px 20px;background:#000;color:#fff;border:none;border-radius:6px;cursor:pointer">Reload Page</button>
      </div>
    </div>
  `;
}
