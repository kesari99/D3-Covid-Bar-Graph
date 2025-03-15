COVID-19 Daily New Cases Bar Chart
This repository contains a React component that visualizes COVID-19 daily new cases in the US using D3.js. The interactive bar chart fetches data from the COVID Tracking Project API and displays useful details such as the number of new cases and deaths for each day. It includes features such as dark mode, adjustable date ranges, responsive resizing, and animated tooltips.

Features
Responsive Chart: Automatically resizes based on container width.

Interactive Tooltips: Hover over bars to view detailed statistics.

Dark Mode Toggle: Switch between light and dark themes.

Date Range Options: Buttons to display 30, 60, or 90 days of data.

Loading & Error States: User-friendly feedback during data fetching or error scenarios.

Styled with Tailwind CSS: Easy to customize using utility-first CSS classes.

Demo
Demo Screenshot
(Include a screenshot of the component or a link to a live demo if available.)

Getting Started
These instructions will help you set up and run the project locally.

Prerequisites
Node.js (v12 or higher)

npm or yarn

A React project environment (e.g., using Create React App or Next.js)

Installation
Clone the Repository:

bash
Copy
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
Install Dependencies:

bash
Copy
npm install
# or
yarn install
Start the Development Server:

bash
Copy
npm run dev
# or
yarn dev
Open the App:

Navigate to http://localhost:5173 in your browser.

Usage
Controls
Days to Show: Use the buttons to filter data for the last 30, 60, or 90 days.

Light/Dark Mode: Toggle between themes using the sun/moon icon button.

Tooltips
Hover over any bar to see:

Date

Number of new cases

Number of deaths

Code Structure
src/App.jsx: Main React component containing the chart logic.

src/main.jsx: Entry point for the React app.

src/index.css: Tailwind CSS styles.

vite.config.js: Vite configuration file.

package.json: Lists project dependencies and scripts.
