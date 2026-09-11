import asyncio
import logging
import datetime
from app.database import SessionLocal
from app.services.alert_service import alert_service

logger = logging.getLogger("LandGuard.SchedulerService")

class BackgroundAlertScheduler:
    def __init__(self, interval_seconds: int = 1800):  # 1800s = 30 minutes
        self.interval_seconds = interval_seconds
        self._task = None
        self._is_running = False

    async def _scheduler_loop(self):
        logger.info(f"Landslide Real-Time Alert Scheduler started. Periodic cycle: every {self.interval_seconds // 60} minutes.")
        
        # Non-blocking initial warm-up delay so server starts immediately
        await asyncio.sleep(3)
        await self.run_evaluation_cycle()

        while self._is_running:
            try:
                await asyncio.sleep(self.interval_seconds)
                if self._is_running:
                    await self.run_evaluation_cycle()
            except asyncio.CancelledError:
                logger.info("Scheduler task cancelled.")
                break
            except Exception as e:
                logger.error(f"Error in background scheduler cycle: {e}", exc_info=True)
                await asyncio.sleep(30)

    async def run_evaluation_cycle(self):
        logger.info(f"Starting 30-minute weather & landslide inference cycle (Pre-trained ML inference only, no retraining)...")
        db = SessionLocal()
        try:
            summary = await alert_service.check_all_monitored_roads(db)
            logger.info(
                f"Scheduler cycle complete: Checked {summary['total_roads_checked']} road segments. "
                f"Generated {summary['new_alerts_count']} new alerts."
            )
        except Exception as e:
            logger.error(f"Failed to execute alert evaluation cycle: {e}", exc_info=True)
        finally:
            db.close()

    def start(self):
        if not self._is_running:
            self._is_running = True
            self._task = asyncio.create_task(self._scheduler_loop())

    def stop(self):
        if self._is_running:
            self._is_running = False
            if self._task:
                self._task.cancel()
            logger.info("Background Alert Scheduler stopped.")

scheduler_service = BackgroundAlertScheduler(interval_seconds=1800)
