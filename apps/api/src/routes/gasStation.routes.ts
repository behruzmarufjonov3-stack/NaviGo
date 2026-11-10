import { Router, Request, Response } from 'express';
import { gasStationStore } from '../db/gasStation.store';
import { fuelRatesService } from '../services/fuelRates.service';

export const gasStationRouter = Router();

// GET /api/v1/gas-stations
gasStationRouter.get('/', (req: Request, res: Response) => {
  const fuel = req.query.fuel as string | undefined;
  const search = req.query.q as string | undefined;
  const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
  const lon = req.query.lon ? parseFloat(req.query.lon as string) : undefined;

  const stations = gasStationStore.getAll(fuel, search, lat, lon);
  res.json({ stations });
});

// GET /api/v1/gas-stations/rates/summary (Live synced from GoldenPages & Texnosmart)
gasStationRouter.get('/rates/summary', async (req: Request, res: Response) => {
  const forceSync = req.query.sync === 'true';
  const rates = forceSync ? await fuelRatesService.syncRatesLive() : fuelRatesService.getRates();
  res.json(rates);
});

// POST /api/v1/gas-stations/rates/sync (Explicit manual live re-sync)
gasStationRouter.post('/rates/sync', async (req: Request, res: Response) => {
  const rates = await fuelRatesService.syncRatesLive();
  res.json({ success: true, rates });
});

// GET /api/v1/gas-stations/:id
gasStationRouter.get('/:id', (req: Request, res: Response) => {
  const station = gasStationStore.getById(req.params.id);
  if (!station) {
    res.status(404).json({ error: 'Gas station not found' });
    return;
  }
  res.json({ station });
});

// POST /api/v1/gas-stations/:id/report (Community live update)
gasStationRouter.post('/:id/report', (req: Request, res: Response) => {
  const { isOpen, pressureBar, queueCarsCount, voteType, note } = req.body;
  const updated = gasStationStore.updateReport(req.params.id, {
    stationId: req.params.id,
    isOpen,
    pressureBar,
    queueCarsCount,
    voteType,
    note
  });

  if (!updated) {
    res.status(404).json({ error: 'Gas station not found' });
    return;
  }

  res.json({ success: true, station: updated });
});
