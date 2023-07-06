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
          country: response.data.country,
          region: response.data.region,
        }));
        setIpList([...ipList, ...ipData]);
      })
      .catch((error) => {
        console.log(error);
        window.alert("Por favor desactiva el bloqueador de anuncios (adblocker) para que la web funcione correctamente.");
      });
    setManualIp("");
  };

  const access_token = "814ee26772f463";
  const handleFileSubmit = (event) => {
    event.preventDefault();
    setLoadingState(true);
    const ipArray = fileContent.split(/\r?\n/).filter((ip) => ip !== "");
    const requests = ipArray.map((ip) => axios.get(`https://ipinfo.io/${ip}?token=${access_token}`));
    Promise.all(requests)
      .then((responses) => {
        const ipData = responses.map((response) => ({
          ip: response.data.ip,
          org: response.data.org,
          country: response.data.country,
          region: response.data.region,
        }));
        setIpList(ipData);
      })
      .catch((error) => {
        console.log(error);
        window.alert("Se produjo un error de red. Verifica tu conexión a Internet y asegúrate de que el adblocker esté desactivado.");
      })
      .finally(() => setLoadingState(false));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const contents = e.target.result;
      setFileContent(contents);
    };
    reader.readAsText(file);
  };

  const handleManualIpChange = (event) => {
    setManualIp(event.target.value);
  };

  const handleDeleteIp = (ip) => {
    const updatedList = ipList.filter((item) => item.ip !== ip);
    setIpList(updatedList);
  };

  const handleDownload = () => {
    if (ipList.length === 0) {
      return;
    }
  
    const worksheet = XLSX.utils.json_to_sheet(ipList, { header: ["ip", "org", "country", "region"] });
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
          <input type="text" value={manualIp} onChange={handleManualIpChange} className="input-text" />
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
                    <li>País: {ipData.country}</li>
                    <li>Provincia: {ipData.region}</li>
                  </ul>
                  <button onClick={() => handleDeleteIp(ipData.ip)} className="small-button button-primary">Eliminar</button>

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
