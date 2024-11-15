const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Definición de insumos como constante
const insumos = [
  "Incluídos en el costo del presupuesto con excepción de insumos especiales",
  "Alcohol Etílico (1lt)",
  "Aromatizador/Odorante Aer.",
  "Bolsas Compactad. Negras [80x100]",
  "Bolsas Compactad. Transp. [80x110]",
  "Bolsas Consorcio Negras [60x90]",
  "Bolsas Residuos Negras [45x60]",
  "Cera Auto Brillo",
  "Cera Incolora (5lt)",
  "Cera p/Madera (5lt)",
  "Cera p/Madera (850cc)",
  "Cera Roja (5lt)",
  "Cloro (5lt)",
  "Desengrasante Alcalino Prep. (5lt)",
  "Desengrasante Amoniac. Prep. (5lt)",
  "Desinfectante Aer. (360cc)",
  "Desodorante Ambiental Aer. (360cc)",
  "Detergente (1lt)",
  "Detergente (250cc)",
  "Detergente (500cc)",
  "Detergente (750cc)",
  "Fibra Verde",
  "Franela/Gamuza Paño [40x50]",
  "Hipoclorito Prep. (5lt)",
  "Insecticida p/Moscas",
  "Jabón Líq. p/Manos Prep. (5lt)",
  "Jabón Tocador (3un)",
  "Lampazo Líq. Amarillo (5lt)",
  "Lampazo Líq. Azúl (5lt)",
  "Lavandina Prep. (5lt)",
  "Limpiador Crema CIF (750cc)",
  "Limpiador p/Baños (1lt)",
  "Limpiador p/Pisos Plast/Flot (800cc)",
  "Limpiavidrios Líq (1lt)",
  "Limpiavidrios Líq. Prep. (5lt)",
  "Lustramuebles Aer. (360cc)",
  "Papel Higiénico (4un x30mt)",
  "Papel Higiénico JUMBO (8un)",
  "Perfumina Prep. (5lt)",
  "Removedor Sarro HARPIC",
  "Rollo Cocina (3un)",
  "Rollo Industrial [20cm](1un)",
  "Toallas Intercalad. [Beige](250un)",
  "Toallas Intercalad. [Blancas](250un)",
  "Toallas Rollo p/Manos [p/RE-MAX]",
  "Trapo Piso Blanco",
  "Trapo Piso Gris",
  "Valerina Común",
  "Virulana"
];

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  win.loadFile('index.html');

  // Manejar la solicitud para abrir el diálogo de guardar archivo
ipcMain.handle('dialog:saveFile', async () => {
  const result = await dialog.showSaveDialog({
      title: 'Guardar PDF',
      defaultPath: 'presupuesto.pdf', // Nombre por defecto
      filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
  });
  return result.filePath; // Retorna la ruta del archivo seleccionado
});

  // Abrir herramientas de desarrollo
  // win.webContents.openDevTools(); // Esto abrirá la consola de desarrollador
}

// Maneja la solicitud de la ruta de descarga
ipcMain.handle('get-download-path', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  return result.filePaths[0]; // Retorna la ruta del directorio seleccionado
});

// Manejador de la solicitud 'get-insumos'
ipcMain.handle('get-insumos', async () => {
  return insumos; // Devuelve la lista de insumos directamente
});

app.whenReady().then(() => {
  createWindow(); // Crea la ventana principal de la aplicación

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
