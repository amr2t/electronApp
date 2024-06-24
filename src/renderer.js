document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('button1').addEventListener('click', () => {
    console.log('Download button clicked');
    window.electronAPI.downloadPostgres('https://sbp.enterprisedb.com/getfile.jsp?fileid=1259105')
      .then(response => {
        if (response.success) {
          console.log('Postgres downloaded successfully');
        } else {
          console.error('Error downloading Postgres:', response.error);
        }
      });
  });

window.electronAPI.onDownloadProgress((event, progress) => {
  const progressBar = document.getElementById('progress-bar');
  const progressContainer = document.getElementById('progress-container');
  progressContainer.style.display = 'block';
  progressBar.style.width = `${progress.percent * 100}%`;
  progressBar.textContent = `${Math.round(progress.percent * 100)}%`;
});

window.electronAPI.onDownloadComplete(() => {
  // const progressBar = document.getElementById('progress-bar');
  // const progressContainer = document.getElementById('progress-container');
  // progressBar.style.width = '100%';
  // progressBar.textContent = 'Download Complete';
  // setTimeout(() => {
  //   progressContainer.style.display = 'none';
  // }, 2000);
  console.log('Download complete, changing page...');
    // Example: change page after 2 seconds (adjust timing as needed)
    setTimeout(() => {
      window.location.href = 'afterDownloadPage.html'; // Replace with your new page URL
    }, 2000);
});

document.getElementById('install').addEventListener('click', () => {
  ipcRenderer.invoke('install-postgres', '/path/to/downloaded/installer')
    .then(response => {
      if (response.success) {
        console.log('Postgres installed successfully');
      } else {
        console.error('Error installing Postgres:', response.error);
      }
    });

});

document.getElementById('button2').addEventListener('click', () => {
  ipcRenderer.invoke('download-something', 'http://example.com/somefile')
    .then(response => {
      if (response.success) {
        console.log('File downloaded successfully');
      } else {
        console.error('Error downloading file:', response.error);
      }
    });
});

});