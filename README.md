# Fiscal.ly - Manage Your Finances Smarter with AI

Fiscal.ly is an intuitive personal finance management app that empowers users to track their spending, analyze trends, and get AI-driven insights.
---
Features 🌟

Spending Dashboard
-	Pie Chart: View spending distribution across categories.
-	Bar Chart: Compare your spending month-by-month.
-	Interactive Filters: Analyze your spending based on categories or specific time frames.

AI-Powered Insights
-	Query your finances in natural language using GPT4All.
-	Example queries:
- “How much did I spend on groceries this month?”
-	“What was my total spending on rent last year?”

Receipt Upload
-	Upload receipts directly to the app.
-	[Planned Feature] Automatically parse and categorize receipt data using OCR and machine learning.

Detailed Transactions
-	Easily add, edit, or delete transactions.
-	Categorize your spending for better insights.

User Accounts
-	Secure user authentication with registration and login.
-	Personalized dashboards and data for each user.
---
 Tech Stack ⚙️

Frontend
-	React with React-Bootstrap for a responsive and interactive UI.
-	Chart rendering using Chart.js.

Backend
-	Django and Django REST Framework for robust APIs and data management.
-	PostgreSQL for efficient and secure data storage.

AI Integration
-	GPT4All for local, privacy-focused AI-driven insights.

Miscellaneous
-	Git LFS for handling large model files.
-	Pillow for image processing (receipt uploads).

Missing Model File: mistral-7b-instruct-v0.1.Q4_0.gguf

The file backend/models/mistral-7b-instruct-v0.1.Q4_0.gguf is not included in the repository because it exceeds GitHub’s file size limits.

How to Obtain the File:
1. 	Download the model from the GPT4All Models page.
- Look for the model named mistral-7b-instruct-v0.1.Q4_0.gguf.
2. Place the downloaded file in the following directory:

``` backend/models/ ```

Ensure the directory structure matches the project’s setup.
