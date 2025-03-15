<!-- README.md -->
# COVID-19 Daily New Cases Bar Chart

This repository contains a React component that visualizes COVID-19 daily new cases in the US using D3.js. The interactive bar chart fetches data from the [COVID Tracking Project API](https://api.covidtracking.com/v1/us/daily.json) and displays useful details such as the number of new cases and deaths for each day. It includes features such as dark mode, adjustable date ranges, responsive resizing, and animated tooltips.

## Features

- **Responsive Chart:** Automatically resizes based on container width.
- **Interactive Tooltips:** Hover over bars to view detailed statistics.
- **Dark Mode Toggle:** Switch between light and dark themes.
- **Date Range Options:** Buttons to display 30, 60, or 90 days of data.
- **Loading & Error States:** User-friendly feedback during data fetching or error scenarios.
- **Styled with Tailwind CSS:** Easy to customize using utility-first CSS classes.

## Demo

![Demo Screenshot](./screenshot.png)  
*(Include a screenshot of the component or a link to a live demo if available.)*

## Getting Started

These instructions will help you set up and run the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (v12 or higher)
- npm or yarn
- A React project environment (e.g., using Create React App or Next.js)

### Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/your-username/your-repo-name.git

cd your-repo-name
npm install
# or
yarn install
