/**
 * src/components/QrScanner.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   Camera-based QR capture for "scan to log an issue". Reusable so any form
 *   that wants a scan entry point (currently just LogIssue.jsx) can mount one
 *   dialog rather than reimplementing the camera lifecycle.
 *
 * WHAT IT ACHIEVES
 *   Wraps html5-qrcode's full-UI scanner (camera picker, torch, works in any
 *   modern browser, no native app) inside an MUI Dialog. The scanner instance
 *   is created on open and torn down on close so the camera stream doesn't
 *   stay live in the background.
 */
import { useEffect, useRef } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Html5QrcodeScanner } from 'html5-qrcode';

const ELEMENT_ID = 'qr-scanner-region';

export default function QrScanner({ open, onClose, onScan }) {
  const scannerRef = useRef(null);
  // Latest callback in a ref so the scanner isn't torn down/recreated on
  // every parent render — only `open` should control its lifecycle.
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    if (!open) return undefined;

    const scanner = new Html5QrcodeScanner(
      ELEMENT_ID,
      { fps: 10, qrbox: { width: 250, height: 250 }, rememberLastUsedCamera: true },
      /* verbose= */ false,
    );
    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => onScanRef.current(decodedText),
      // Fires continuously while no QR is in frame — not an error worth surfacing.
      () => {},
    );

    return () => {
      scannerRef.current?.clear().catch(() => {});
      scannerRef.current = null;
    };
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Scan QR code
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Box id={ELEMENT_ID} sx={{ '& video': { borderRadius: 1 } }} />
      </DialogContent>
    </Dialog>
  );
}
