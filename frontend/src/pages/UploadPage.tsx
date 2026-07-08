import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, AlertTriangle, CheckCircle2, FileWarning } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import { Dropzone } from '../components/upload/Dropzone';
import { ProcessingAnimation } from '../components/upload/ProcessingAnimation';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Alert } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import { uploadStatement, pollUntilComplete } from '../lib/api';
import { useNotifications } from '../contexts/NotificationContext';
import { useToast } from '../contexts/ToastContext';
import type { PipelineRunStatus } from '../types';

const MAX_SIZE_BYTES = 10 * 1024 * 1024;

type Stage = 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [result, setResult] = useState<PipelineRunStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { notifyUploaded } = useNotifications();
  const toast = useToast();
  const navigate = useNavigate();

  function handleFileSelected(selected: File) {
    setValidationError(null);
    if (selected.size > MAX_SIZE_BYTES) {
      setValidationError('That file is larger than 10MB. Please upload a smaller statement.');
      return;
    }
    setFile(selected);
  }

  async function handleUpload() {
    if (!file) return;
    setStage('uploading');
    setUploadProgress(0);
    setErrorMessage(null);

    try {
      const { run_id } = await uploadStatement(file, setUploadProgress);
      notifyUploaded(file.name);
      toast.success('Statement uploaded', 'Your AI analysis is starting now.');
      setStage('processing');

      let ticks = 0;
      const final = await pollUntilComplete(run_id, {
        onTick: () => {
          ticks += 1;
          setStageIndex(Math.min(3, Math.floor(ticks / 2)));
        },
      });

      if (final.status === 'completed') {
        setResult(final);
        setStage('completed');
      } else {
        setErrorMessage(final.error_message ?? 'The analysis pipeline failed at ' + (final.failed_at_stage ?? 'an unknown stage') + '.');
        setStage('failed');
      }
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Upload failed. Please try again.');
      setStage('failed');
    }
  }

  function reset() {
    setFile(null);
    setStage('idle');
    setUploadProgress(0);
    setStageIndex(0);
    setResult(null);
    setErrorMessage(null);
  }

  return (
    <div>
      <PageHeader
        title="Upload documents"
        description="Upload a bank statement to generate a fresh credit readiness score and AI recommendations."
      />

      <div className="mx-auto max-w-2xl">
        <AnimatePresence mode="wait">
          {(stage === 'idle' || stage === 'uploading') && (
            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card>
                <CardHeader title="Bank statement" subtitle="Supported formats: PDF, Excel, CSV, or scanned images" />
                <Dropzone onFileSelected={handleFileSelected} selectedFile={file} disabled={stage === 'uploading'} />

                {validationError && (
                  <div className="mt-4">
                    <Alert variant="danger" title="File not accepted">
                      {validationError}
                    </Alert>
                  </div>
                )}

                {stage === 'uploading' && (
                  <div className="mt-5">
                    <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-ink-secondary">
                      <span>Uploading…</span>
                      <span className="stat-font">{uploadProgress}%</span>
                    </div>
                    <ProgressBar value={uploadProgress} />
                  </div>
                )}

                <Button
                  fullWidth
                  className="mt-6"
                  disabled={!file}
                  loading={stage === 'uploading'}
                  iconRight={<ArrowRight size={16} />}
                  onClick={handleUpload}
                >
                  Upload and analyze
                </Button>
              </Card>
            </motion.div>
          )}

          {stage === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProcessingAnimation activeIndex={stageIndex} />
            </motion.div>
          )}

          {stage === 'completed' && result && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
              <Card>
                <div className="flex flex-col items-center py-4 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-success-50 text-success"
                  >
                    <CheckCircle2 size={32} />
                  </motion.div>
                  <h2 className="mt-4 text-lg font-semibold text-ink">Analysis complete</h2>
                  <p className="mt-1.5 max-w-sm text-sm text-ink-secondary">
                    Processed {result.intake_result?.total_rows_processed ?? 0} transactions
                    {result.intake_result?.total_rows_flagged ? (
                      <> — flagged {result.intake_result.total_rows_flagged} rows for review</>
                    ) : null}
                    .
                  </p>
                  {result.scores && result.scores.length > 0 && (
                    <Badge tone="success" className="mt-3">
                      Best score: {Math.round(Math.max(...result.scores.map((s) => s.overall_score)))} / 100
                    </Badge>
                  )}
                  <div className="mt-6 flex w-full gap-3">
                    <Button variant="outline" fullWidth onClick={reset}>
                      Upload another
                    </Button>
                    <Button fullWidth iconRight={<ArrowRight size={16} />} onClick={() => navigate('/app/analysis')}>
                      View analysis
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {stage === 'failed' && (
            <motion.div key="failed" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
              <Card>
                <div className="flex flex-col items-center py-4 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-50 text-danger">
                    <FileWarning size={30} />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-ink">Analysis failed</h2>
                  <p className="mt-1.5 max-w-sm text-sm text-ink-secondary">{errorMessage}</p>
                  <Button className="mt-6" onClick={reset}>
                    Try again
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {stage === 'idle' && (
          <div className="mt-5">
            <Alert variant="info" title="Tip for best results">
              Upload a statement covering at least 3 months of transactions — the AI needs enough history to
              judge cash-flow stability accurately.
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
}
