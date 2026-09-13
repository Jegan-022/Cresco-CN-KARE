export default function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json({
    status: 'ok',
    timestamp: Date.now(),
    uptime: process.uptime ? process.uptime() : 0,
    service: 'cresco-cn-api'
  });
}
