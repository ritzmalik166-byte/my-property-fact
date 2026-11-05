"use client";

import { useEffect, useRef, useState } from "react";
import { Alert, Button, Form, Modal, ProgressBar, Table } from "react-bootstrap";
import { toast } from "../../_lib/adminToast";
import {
  analyzeFiles,
  downloadReport,
  downloadTemplate,
  resumeKey,
  runImport,
} from "./bulkProjectImport";

const fmtBytes = (n) => {
  if (!n) return "0 MB";
  if (n > 1024 ** 3) return `${(n / 1024 ** 3).toFixed(1)} GB`;
  return `${Math.max(1, Math.round(n / 1024 ** 2))} MB`;
};

const fmtDuration = (ms) => {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ${s % 60}s`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
};

/**
 * Upload any number of projects from Excel plus images (zips or a folder). Files are checked
 * in the browser first, then sent in small batches; see bulkProjectImport.js.
 */
export default function BulkProjectUploadModal({ show, onHide, onFinished }) {
  const [excelFile, setExcelFile] = useState(null);
  const [zipFiles, setZipFiles] = useState([]);
  const [folderFiles, setFolderFiles] = useState([]);
  const [stage, setStage] = useState("select"); // select | checking | review | importing | done
  const [plan, setPlan] = useState(null);
  const [progress, setProgress] = useState(null);
  const [resumeFrom, setResumeFrom] = useState(0);
  const stopRef = useRef(false);
  const [stopRequested, setStopRequested] = useState(false);

  const importing = stage === "importing";
  const storageKey = excelFile ? resumeKey(excelFile, zipFiles, folderFiles) : null;

  const reset = () => {
    plan?.close?.();
    setExcelFile(null);
    setZipFiles([]);
    setFolderFiles([]);
    setStage("select");
    setPlan(null);
    setProgress(null);
    setResumeFrom(0);
    stopRef.current = false;
    setStopRequested(false);
  };

  useEffect(() => {
    if (!show) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  // Warn before closing the tab mid-import.
  useEffect(() => {
    if (!importing) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [importing]);

  const handleCheck = async () => {
    if (!excelFile) {
      toast.error("Please select the Excel file");
      return;
    }
    setStage("checking");
    try {
      const result = await analyzeFiles(excelFile, zipFiles, folderFiles);
      setPlan(result);
      let saved = 0;
      try {
        saved = Number(localStorage.getItem(storageKey) || 0);
      } catch {
        saved = 0;
      }
      setResumeFrom(saved > 0 && saved < result.batches.length ? saved : 0);
      setStage("review");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Could not read the files");
      setStage("select");
    }
  };

  const handleStart = async (startBatch) => {
    stopRef.current = false;
    setStopRequested(false);
    setStage("importing");
    try {
      const result = await runImport(plan, {
        apiUrl: process.env.NEXT_PUBLIC_API_URL,
        startBatch,
        storageKey,
        onUpdate: setProgress,
        shouldStop: () => stopRef.current,
      });
      setProgress(result);
      setStage("done");
      const problems = result.rowErrors.length + plan.invalidRows.length;
      if (result.stopped) toast.warning("Import stopped. You can resume it later.");
      else if (problems) toast.warning(`Import finished with ${problems} row problem(s). Download the report for details.`);
      else toast.success("All projects imported.");
      onFinished?.();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Import failed");
      setStage("review");
    }
  };

  const requestStop = () => {
    stopRef.current = true;
    setStopRequested(true);
  };

  const p = progress;
  const totalRows = plan?.rows.length ?? 0;
  const totalImages = plan ? plan.matchedImages + plan.orphanImages.length : 0;
  const pct = p && p.totalBatches ? Math.round((p.batchIndex / p.totalBatches) * 100) : 0;
  let eta = null;
  if (p && importing && p.batchIndex > p.startBatch) {
    const per = (Date.now() - p.startedAt) / (p.batchIndex - p.startBatch);
    eta = fmtDuration(per * (p.totalBatches - p.batchIndex));
  }

  const stageText = () => {
    if (!p) return "Starting…";
    if (p.stage === "preparing") return "Shrinking images for this batch…";
    if (p.stage === "uploading") return `Uploading… ${Math.round(p.uploadPct * 100)}%`;
    if (p.stage === "saving" && p.job) {
      return p.job.phase === "images"
        ? `Saving images… ${p.job.imagesDone} / ${p.job.imagesTotal}`
        : `Saving projects… ${p.job.rowsDone} / ${p.job.rowsTotal}`;
    }
    if (p.stage === "saving") return "Saving…";
    return p.stage.charAt(0).toUpperCase() + p.stage.slice(1) + "…";
  };

  return (
    <Modal
      show={show}
      onHide={importing ? undefined : onHide}
      backdrop={importing ? "static" : true}
      keyboard={!importing}
      size="lg"
      centered
    >
      <Modal.Header closeButton={!importing}>
        <Modal.Title>Upload Projects</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {(stage === "select" || stage === "checking") && (
          <>
            <Form.Group className="mb-3" controlId="bulkExcel">
              <Form.Label className="fw-bold">
                Excel file <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setExcelFile(e.target.files?.[0] ?? null)}
              />
              <Form.Text className="text-muted">
                One row per project, any number of rows.{" "}
                <Button variant="link" size="sm" className="p-0 align-baseline" onClick={downloadTemplate}>
                  Download template
                </Button>
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3" controlId="bulkZips">
              <Form.Label className="fw-bold">Images: one or more zip files</Form.Label>
              <Form.Control
                type="file"
                accept=".zip"
                multiple
                onChange={(e) => setZipFiles(Array.from(e.target.files || []))}
              />
              <Form.Text className="text-muted">
                No size limit. Name images like ProjectName_ImageType_My-Property-Fact.jpg
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3" controlId="bulkFolder">
              <Form.Label className="fw-bold">…or an images folder</Form.Label>
              <Form.Control
                type="file"
                multiple
                webkitdirectory=""
                directory=""
                onChange={(e) => setFolderFiles(Array.from(e.target.files || []))}
              />
              {folderFiles.length > 0 && (
                <Form.Text className="text-muted">{folderFiles.length} files selected</Form.Text>
              )}
            </Form.Group>
            <div className="d-flex gap-2 justify-content-end">
              <Button variant="secondary" onClick={onHide}>
                Cancel
              </Button>
              <button
                type="button"
                className="admin-header-btn admin-header-btn--primary"
                onClick={handleCheck}
                disabled={!excelFile || stage === "checking"}
              >
                {stage === "checking" ? "Checking files…" : "Check files"}
              </button>
            </div>
          </>
        )}

        {stage === "review" && plan && (
          <>
            <Table size="sm" bordered className="mb-3">
              <tbody>
                <tr>
                  <td>Projects ready to upload</td>
                  <td className="fw-bold">{totalRows}</td>
                </tr>
                <tr>
                  <td>Rows with missing data (will be skipped)</td>
                  <td className={plan.invalidRows.length ? "fw-bold text-danger" : ""}>
                    {plan.invalidRows.length}
                  </td>
                </tr>
                <tr>
                  <td>Images matched to Excel rows</td>
                  <td className="fw-bold">{plan.matchedImages}</td>
                </tr>
                <tr>
                  <td>Images for projects not in this Excel (matched to existing projects if possible)</td>
                  <td>{plan.orphanImages.length}</td>
                </tr>
                <tr>
                  <td>Projects with no images</td>
                  <td className={plan.rowsWithoutImages.length ? "text-warning fw-bold" : ""}>
                    {plan.rowsWithoutImages.length}
                  </td>
                </tr>
                <tr>
                  <td>Original image size</td>
                  <td>{fmtBytes(plan.totalImageBytes)} (shrunk before upload)</td>
                </tr>
                <tr>
                  <td>Batches</td>
                  <td>{plan.batches.length}</td>
                </tr>
              </tbody>
            </Table>

            {plan.invalidRows.length > 0 && (
              <Alert variant="danger" className="small">
                <div className="fw-bold mb-1">These rows will not be uploaded:</div>
                {plan.invalidRows.slice(0, 8).map((r) => (
                  <div key={r.excelRow}>
                    Row {r.excelRow}
                    {r.name ? ` (${r.name})` : ""}: {r.reason}
                  </div>
                ))}
                {plan.invalidRows.length > 8 && <div>…and {plan.invalidRows.length - 8} more (see report)</div>}
              </Alert>
            )}
            {plan.warnings.length > 0 && (
              <Alert variant="warning" className="small">
                {plan.warnings.slice(0, 8).map((w) => (
                  <div key={w}>{w}</div>
                ))}
                {plan.warnings.length > 8 && <div>…and {plan.warnings.length - 8} more</div>}
              </Alert>
            )}
            {plan.rowsWithoutImages.length > 0 && plan.rowsWithoutImages.length <= 10 && (
              <Alert variant="light" className="small border">
                No images found for: {plan.rowsWithoutImages.map((r) => r.name).join(", ")}
              </Alert>
            )}

            <div className="d-flex gap-2 justify-content-end flex-wrap">
              <Button variant="secondary" onClick={() => { plan.close?.(); setPlan(null); setStage("select"); }}>
                Back
              </Button>
              {resumeFrom > 0 && (
                <Button variant="outline-primary" onClick={() => handleStart(resumeFrom)}>
                  Resume from batch {resumeFrom + 1} of {plan.batches.length}
                </Button>
              )}
              <button
                type="button"
                className="admin-header-btn admin-header-btn--primary"
                onClick={() => handleStart(0)}
                disabled={plan.batches.length === 0}
              >
                {resumeFrom > 0 ? "Start over" : `Upload ${totalRows} projects`}
              </button>
            </div>
          </>
        )}

        {(stage === "importing" || stage === "done") && plan && (
          <>
            <ProgressBar
              now={stage === "done" && !p?.stopped ? 100 : pct}
              label={`${stage === "done" && !p?.stopped ? 100 : pct}%`}
              animated={importing}
              className="mb-2"
              style={{ height: 22 }}
            />
            {importing && (
              <div className="small text-muted mb-3">
                Batch {Math.min((p?.batchIndex ?? 0) + 1, p?.totalBatches ?? 1)} of{" "}
                {p?.totalBatches ?? plan.batches.length} · {stageText()}
                {eta && ` · about ${eta} left`}
              </div>
            )}
            <Table size="sm" bordered className="mb-3">
              <tbody>
                <tr>
                  <td>Projects processed</td>
                  <td>
                    {p?.rowsDone ?? 0} / {totalRows}
                  </td>
                </tr>
                <tr>
                  <td>Created / updated</td>
                  <td>
                    {p?.created ?? 0} / {p?.updated ?? 0}
                  </td>
                </tr>
                <tr>
                  <td>Images saved</td>
                  <td>
                    {p?.imagesSaved ?? 0}
                    {p?.imagesSkipped ? ` (${p.imagesSkipped} had no matching project)` : ""} · sent{" "}
                    {p?.imagesDone ?? 0} / {totalImages}
                  </td>
                </tr>
                <tr>
                  <td>Row problems</td>
                  <td className={(p?.rowErrors.length || plan.invalidRows.length) ? "text-danger fw-bold" : ""}>
                    {(p?.rowErrors.length ?? 0) + plan.invalidRows.length}
                  </td>
                </tr>
              </tbody>
            </Table>
            {p?.batchErrors.length > 0 && (
              <Alert variant="danger" className="small">
                {p.batchErrors.length} batch(es) failed after retries. Run the upload again with the
                same files: projects already saved are updated, not duplicated.
              </Alert>
            )}
            {stage === "done" && p?.stopped && (
              <Alert variant="info" className="small">
                Stopped after batch {p.batchIndex} of {p.totalBatches}. Choose the same files again
                and you will be offered to resume.
              </Alert>
            )}
            <div className="d-flex gap-2 justify-content-end">
              {importing ? (
                <Button variant="outline-danger" onClick={requestStop} disabled={stopRequested}>
                  {stopRequested ? "Stopping after this batch…" : "Stop after this batch"}
                </Button>
              ) : (
                <>
                  <Button variant="outline-primary" onClick={() => downloadReport(plan, p)}>
                    Download report
                  </Button>
                  <Button variant="secondary" onClick={onHide}>
                    Close
                  </Button>
                </>
              )}
            </div>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
}
