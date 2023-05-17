import React, { useState } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { css } from "@emotion/react";
import { PacmanLoader, RingLoader } from "react-spinners";


function App() {
  const [ipList, setIpList] = useState([]);
  const [loading, setLoading] = useState(false);
  const setLoadingState = (value) => {
    setLoading(value);
  };  
  const [currentIp, setCurrentIp] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [manualIp, setManualIp] = useState("");
  const handleManualIpSubmit = (event) => {
    event.preventDefault();
    if (manualIp.trim() === "") {
      console.log("Ingrese una dirección IP.");
      return;
    }
    const ipArray = manualIp.trim().split(/\s+/);
    const requests = ipArray.map((ip) => axios.get(`https://ipinfo.io/${ip}?token=${access_token}`));
    Promise.all(requests)
      .then((responses) => {
        const ipData = responses.map((response) => ({
          ip: response.data.ip,
          org: response.data.org,
        }));
        setIpList([...ipList, ...ipData]);
      })
      .catch((error) => console.log(error));
    setManualIp("");
  };
  

  const handleDeleteIp = (index) => {
    const filteredList = ipList.filter((ipData, idx) => idx !== index);
    setIpList(filteredList);
  };
  
  const access_token = "814ee26772f463";
  
  const handleManualIpChange = (e) => {
    setManualIp(e.target.value);
  };
  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      setFileContent(event.target.result);
    };
    reader.readAsText(file);
  };

  const handleFileSubmit = (event) => {
    event.preventDefault();
    setLoadingState(true); // Agrega esta línea
    const ipArray = fileContent.split(/\r?\n/).filter((ip) => ip !== "");
    const requests = ipArray.map((ip) => axios.get(`https://ipinfo.io/${ip}?token=${access_token}`));
    Promise.all(requests)
      .then((responses) => {
        const ipData = responses.map((response) => ({
          ip: response.data.ip,
          org: response.data.org,
        }));
        setIpList(ipData);
      })
      .catch((error) => console.log(error))
      .finally(() => setLoadingState(false)); // Agrega esta línea
  };
  
  const handleDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(ipList, { header: ["ip", "org"] });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "IP Data");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, "ip_data.xlsx");
  };

  return (
    <div className="container">
      <h1 className="title" style={{ fontFamily: 'My Font' }}>IP-info-CIJ</h1>
      <div className="result-box">
      <form onSubmit={handleFileSubmit}>
  <label>
    Cargue el listado:
    <input type="file" onChange={handleFileChange} className="input-file" />
  </label>
  <button type="submit" className="small-button">
    Consultar
  </button>
</form>
<form onSubmit={handleManualIpSubmit}>
  <label>
    Ingrese las IP's:
  </label>
    <input type="text" value={manualIp} onChange={(e) => handleManualIpChange(e)} className="input-text" />
  <button type="submit" className="small-button">
    Cargar manualmente
  </button>
</form>
<div className="loading-container">
  {loading && (
    <RingLoader
      css={css`
        margin: 0 auto;
        display: block;
      `}
      size={50}
      color={"#FFFFFF"}
      loading={true}
    />
  )}
</div>


{ipList.length > 0 ? (
  <>
  <h2 className="subtitle">Resultados:</h2>
    <button onClick={handleDownload} className="small-button">
      Descargar resultados
    </button>
    
    <div className="ip-list">
      {ipList.map((ipData, index) => (
        <div key={index}>
          <p>
            <strong>{ipData.ip}</strong>
          </p>
          <ul>
            <li>Organización: {ipData.org}</li>
          </ul>
          <button onClick={() => handleDeleteIp(index)} className="small-button button-primary">Eliminar</button>

        </div>
      ))}
    </div>
  </>
) : (
  <p></p>
)}

      </div>
    </div>
    
  );
}

export default App;
