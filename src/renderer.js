document.addEventListener('DOMContentLoaded', () => {

  document.getElementById('button1').addEventListener('click', () => {
    console.log('Download button clicked');
    window.electronAPI.downloadPostgres('https://sbp.enterprisedb.com/getfile.jsp?fileid=1259105')
      .then(response => {
        console.log(response);
        if (response.success) {
          console.log('Postgres downloaded successfully');
        } else {
          console.error('Error downloading Postgres:', response.error);
          alert("not possible jao apna dekh");
        }
      });
  });

  document.getElementById('pause-button').addEventListener('click', () => {
    window.electronAPI.pauseDownload()
      .then(response => {
        if (response.success) {
          console.log('Download paused');
          // Update UI to indicate download paused (disable button, etc.)
        } else {
          // console.log(downloadItem);
          console.error('Error pausing download:', response.error);
          // Handle error (display error message to user)
        }
      });
  });

  document.getElementById('resume-button').addEventListener('click', () => {
    window.electronAPI.resumeDownload()
      .then(response => {
        if (response.success) {
          console.log('Download resumed');
          // Update UI to indicate download resumed (enable button, etc.)
        } else {
          console.error('Error resuming download:', response.error);
          // Handle error (display error message to user)
        }
      });
  });

 window.electronAPI.onDownloadProgress((event, progress) => {
  console.log(progress);
  const p = document.getElementById('p');
  const progressBar = document.getElementById('progress-bar');
  const progressContainer = document.getElementById('progress-container');
  progressContainer.style.display = 'block';
  progressBar.style.width = `${progress.percent * 100}%`;
  progressBar.textContent = `${Math.round(progress.percent * 100)}%`;
  p.textContent = `${progress.transferredBytes+ '/' +progress.totalBytes}`;
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
  window.electronAPI.installPostgres('/path/to/downloaded/installer')
    .then(response => {
      if (response.success) {
        console.log('Postgres installed successfully');
      } else {
        console.error('Error installing Postgres:', response.error);
      }
    });

 });

 document.getElementById('button2').addEventListener('click', () => {
  window.electronAPI.downloadSomething('http://example.com/somefile')
    .then(response => {
      if (response.success) {
        console.log('File downloaded successfully');
      } else {
        console.error('Error downloading file:', response.error);
      }
    });
 });

 document.getElementById('notify').addEventListener('click', () => {
  console.log('Notify button clicked');
  window.electronAPI.notify('Hello, World!');
 });

});