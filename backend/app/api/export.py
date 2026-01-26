"""Export API endpoints."""
from fastapi import APIRouter, Response
from fastapi.responses import StreamingResponse
from app.models.analysis import OptionAnalysis
from app.services.export_service import ExportService
import io

router = APIRouter(prefix="/api/export", tags=["export"])


@router.post("/csv/analysis")
async def export_analysis_csv(analysis: OptionAnalysis):
    """
    Export single option analysis to CSV.
    
    Returns CSV file for download.
    """
    csv_content = ExportService.to_csv(analysis)
    
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=option_analysis_{analysis.option.symbol}.csv"
        }
    )


@router.post("/csv/strategy")
async def export_strategy_csv(strategy_analysis: dict):
    """
    Export strategy analysis to CSV.
    
    Returns CSV file for download.
    """
    csv_content = ExportService.strategy_to_csv(strategy_analysis)
    
    strategy_name = strategy_analysis.get('strategy_name', 'strategy').replace(' ', '_')
    
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={strategy_name}_analysis.csv"
        }
    )
