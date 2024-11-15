presupuesto-electron
presupuesto-electron is a desktop application built with the Electron framework, using JavaScript and Node.js. Its main purpose is to help users create professional quotes using pre-designed templates, which can be exported as PDFs to share with potential clients, showcasing their services effectively.

Features
Intuitive interface for creating and managing quotes.
Pre-designed templates for consistent and professional formatting.
PDF generation for seamless sharing with clients.
Customizable fields to tailor quotes for different services.
Installation
To set up and run the application locally, follow these steps:

Clone the repository:

bash
git clone https://github.com/NoeGaraySalinas/presupuesto-electron.git  
Navigate to the project directory:

bash
cd presupuesto-electron  
Install the dependencies:
The application uses the following key dependencies:

electron: ^32.1.2
electron-builder: ^25.1.8
jspdf: ^2.5.2
jspdf-autotable: ^3.8.3
pdf-lib: ^1.17.1
sqlite3: ^5.1.7
Install them using:
bash
npm install  
Start the application:

bash
npm start  
Usage
Launch the application.
Fill in the required fields, such as client name, service details, and costs.
Generate the quote and export it as a PDF.
Share the PDF with potential clients via email, messaging apps, or other platforms.
Requirements
Node.js (v14 or higher)
npm (v6 or higher)
Project Structure
main.js: Main process for the Electron application.
renderer.js: Handles user interactions and DOM updates.
index.html: Entry point with the user interface.
Contributing
Contributions are welcome! If you find any bugs or have ideas for improvements, feel free to:

Open an issue on the repository.
Submit a pull request with your proposed changes.
Author
Developed by Noe Garay Salinas.

License
This project is licensed under the MIT License.
