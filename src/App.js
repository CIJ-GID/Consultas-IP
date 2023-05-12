import React, { useState } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

function App() {
  const [ipList, setIpList] = useState([]);
  const [currentIp, setCurrentIp] = useState("");
  const [fileContent, setFileContent] = useState("");

  const access_token = "814ee26772f463";

  const handleIpChange = (event) => {
    setCurrentIp(event.target.value);
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
      .catch((error) => console.log(error));
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
      <h1 className="title">Consulta de direcciones IP</h1>
      <div className="result-box">
        <form onSubmit={handleFileSubmit}>
          <label>
            Cargue las ip:⁯⁯⁯⁯
            <input type="file" onChange={handleFileChange} className="input-file" />
          </label>
          <button type="submit" className="small-button">
            Consultar
          </button>
        </form>
        <h2 className="subtitle">Resultados</h2>
        {ipList.length > 0 ? (
          <>
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
                </div>
              ))}
            </div>
          </>
        ) : (
          <p>No se han consultado direcciones IP</p>
        )}
      </div>
    </div>
  );
}

export default App;
