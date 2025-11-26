// pages/index.js
import { useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  useEffect(() => {
    // Load the HTML content from public folder
    fetch('/landing.html')
      .then(response => {
        if (!response.ok) {
          throw new Error('HTML file not found');
        }
        return response.text();
      })
      .then(html => {
        // Insert the HTML into the container
        const container = document.getElementById('landing-container');
        container.innerHTML = html;
        
        // Execute any scripts in the loaded HTML
        const scripts = container.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
          const newScript = document.createElement('script');
          if (scripts[i].src) {
            newScript.src = scripts[i].src;
          } else {
            newScript.textContent = scripts[i].textContent;
          }
          document.body.appendChild(newScript);
        }
      })
      .catch(error => {
        console.error('Error loading landing page:', error);
        document.getElementById('landing-container').innerHTML = `
          <div style="padding: 20px; text-align: center;">
            <h2>Landing page could not be loaded</h2>
            <p>Please make sure landing.html exists in the public folder</p>
          </div>
        `;
      });
  }, []);

  return (
    <>
      <Head>
        <title>NEXO - Invest in Your Future</title>
        <meta
          name="description"
          content="NEXO is your trusted partner for diversified investments in cryptocurrencies, gold, and high-yield assets. Start building wealth today."
        />
      </Head>
      <div id="landing-container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '18px'
        }}>
          Security Verification Loading ...
        </div>
      </div>
    </>
  );
}