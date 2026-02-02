"""Export service for CSV and PDF generation."""
import csv
import io
from typing import List
from datetime import datetime
from app.models.analysis import OptionAnalysis
from app.models.strategy import Strategy


class ExportService:
    """Service for exporting analysis data to CSV and PDF."""
    
    @staticmethod
    def to_csv(analysis_data: OptionAnalysis) -> str:
        """Export single option analysis to CSV format."""
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Header
        writer.writerow(['OptionLab Options Analysis Export'])
        writer.writerow(['Generated:', datetime.now().strftime('%Y-%m-%d %H:%M:%S')])
        writer.writerow([])
        
        # Option Details
        writer.writerow(['Option Details'])
        writer.writerow(['Symbol', analysis_data.option.symbol])
        writer.writerow(['Strike', analysis_data.option.strike])
        writer.writerow(['Expiry', analysis_data.option.expiry])
        writer.writerow(['Type', analysis_data.option.option_type.upper()])
        writer.writerow(['Exercise Style', analysis_data.option.exercise_style.upper()])
        writer.writerow([])
        
        # Market Prices
        writer.writerow(['Market Prices'])
        writer.writerow(['Bid', analysis_data.option.bid])
        writer.writerow(['Ask', analysis_data.option.ask])
        writer.writerow(['Last', analysis_data.option.last])
        writer.writerow(['Volume', analysis_data.option.volume])
        writer.writerow(['Open Interest', analysis_data.option.open_interest])
        writer.writerow([])
        
        # Analysis Results
        writer.writerow(['Analysis Results'])
        writer.writerow(['Theoretical Price', f'{analysis_data.theoretical_price:.4f}'])
        writer.writerow(['Market Price', f'{analysis_data.market_price:.4f}'])
        writer.writerow(['Mispricing', f'{analysis_data.mispricing:.4f}'])
        writer.writerow(['Valuation', analysis_data.valuation])
        writer.writerow([])
        
        # Greeks
        writer.writerow(['Greeks'])
        writer.writerow(['Delta', f'{analysis_data.greeks.delta:.4f}'])
        writer.writerow(['Gamma', f'{analysis_data.greeks.gamma:.4f}'])
        writer.writerow(['Theta', f'{analysis_data.greeks.theta:.4f}'])
        writer.writerow(['Vega', f'{analysis_data.greeks.vega:.4f}'])
        writer.writerow(['Rho', f'{analysis_data.greeks.rho:.4f}'])
        writer.writerow([])
        
        # Volatility
        writer.writerow(['Volatility Analysis'])
        iv = analysis_data.option.implied_volatility
        writer.writerow(['Implied Volatility', '' if iv is None else f'{iv:.2%}'])
        writer.writerow(['Historical Volatility', f'{analysis_data.historical_volatility:.2%}'])
        writer.writerow(['IV Percentile', f'{analysis_data.iv_percentile:.2f}'])
        
        return output.getvalue()
    
    @staticmethod
    def strategy_to_csv(strategy_analysis: dict) -> str:
        """Export strategy analysis to CSV format."""
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Header
        writer.writerow(['OptionLab Strategy Analysis Export'])
        writer.writerow(['Generated:', datetime.now().strftime('%Y-%m-%d %H:%M:%S')])
        writer.writerow([])
        
        # Strategy Info
        writer.writerow(['Strategy Information'])
        writer.writerow(['Strategy Name', strategy_analysis['strategy_name']])
        writer.writerow(['Number of Legs', len(strategy_analysis['legs'])])
        writer.writerow([])
        
        # Legs
        writer.writerow(['Strategy Legs'])
        writer.writerow(['Symbol', 'Strike', 'Expiry', 'Type', 'Quantity', 'Bid', 'Ask'])
        for leg in strategy_analysis['legs']:
            opt = leg['option']
            writer.writerow([
                opt['symbol'],
                opt['strike'],
                opt['expiry'],
                opt['option_type'],
                leg['quantity'],
                opt['bid'],
                opt['ask']
            ])
        writer.writerow([])
        
        # Combined Greeks
        writer.writerow(['Combined Greeks'])
        greeks = strategy_analysis['combined_greeks']
        writer.writerow(['Delta', f"{greeks['delta']:.4f}"])
        writer.writerow(['Gamma', f"{greeks['gamma']:.4f}"])
        writer.writerow(['Theta', f"{greeks['theta']:.4f}"])
        writer.writerow(['Vega', f"{greeks['vega']:.4f}"])
        writer.writerow(['Rho', f"{greeks['rho']:.4f}"])
        writer.writerow([])
        
        # Premium
        writer.writerow(['Premium Analysis'])
        writer.writerow(['Net Premium', f"${strategy_analysis['net_premium']:.2f}"])
        writer.writerow(['Type', 'Debit' if strategy_analysis['net_premium'] < 0 else 'Credit'])
        writer.writerow([])
        
        # P&L Metrics
        writer.writerow(['Profit/Loss Metrics'])
        max_profit = strategy_analysis.get('max_profit')
        max_loss = strategy_analysis.get('max_loss')
        writer.writerow(['Max Profit', 'Unlimited' if max_profit is None else f'${max_profit:.2f}'])
        writer.writerow(['Max Loss', 'Unlimited' if max_loss is None else f'${max_loss:.2f}'])
        
        breakevens = strategy_analysis.get('breakevens', [])
        if breakevens:
            writer.writerow(['Breakeven Points', ', '.join(f'${be:.2f}' for be in breakevens)])
        
        return output.getvalue()
