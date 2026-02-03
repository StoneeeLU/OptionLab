"""Binomial tree pricing for American options."""
from typing import Literal
import math


class BinomialTreePricer:
    """Binomial tree option pricing for American options."""

    @staticmethod
    def _intrinsic(option_type: Literal['call', 'put'], S: float, K: float) -> float:
        if option_type == 'call':
            return max(S - K, 0.0)
        return max(K - S, 0.0)

    @staticmethod
    def _deterministic_american_value(
        option_type: Literal['call', 'put'],
        S: float,
        K: float,
        T: float,
        r: float,
        q: float,
    ) -> float:
        """Deterministic (sigma->0) American value under risk-neutral drift.

        When sigma is ~0, the underlying path is deterministic: S(t)=S0*exp((r-q)t).
        The American option value is the maximum discounted intrinsic value across
        exercise times t in [0,T]. For q=0, this reduces to:
        - call: European value
        - put: intrinsic value
        """
        if T <= 0:
            return BinomialTreePricer._intrinsic(option_type, S, K)

        # Candidate exercise times: endpoints + possible interior stationary point.
        candidates = [0.0, T]
        if q > 0 and r != q:
            # Stationary point from derivative of discounted intrinsic.
            numerator = r * K
            denominator = q * S
            if numerator > 0 and denominator > 0:
                t_star = math.log(numerator / denominator) / (r - q)
                if 0.0 < t_star < T:
                    candidates.append(t_star)

        if option_type == 'call':
            best = max(S * math.exp(-q * t) - K * math.exp(-r * t) for t in candidates)
        else:
            best = max(K * math.exp(-r * t) - S * math.exp(-q * t) for t in candidates)

        return max(best, 0.0)
    
    def price(
        self,
        option_type: Literal['call', 'put'],
        S: float,
        K: float,
        T: float,
        r: float,
        sigma: float,
        steps: int = 100,
        q: float = 0.0
    ) -> float:
        """
        Price American option using binomial tree (CRR model).
        
        Args:
            option_type: 'call' or 'put'
            S: Spot price
            K: Strike price
            T: Time to expiration (years)
            r: Risk-free rate
            sigma: Volatility
            steps: Number of time steps
            q: Dividend yield
            
        Returns:
            Option price
        """
        if T <= 0:
            return self._intrinsic(option_type, S, K)

        if steps <= 0:
            raise ValueError("steps must be positive")

        if sigma is None:
            raise ValueError("sigma is required")

        if sigma < 0:
            raise ValueError("sigma must be non-negative")
        
        # Time step
        dt = T / steps

        # Degenerate cases (sigma ~ 0 or dt too large relative to sigma):
        # CRR requires d < a < u for a valid risk-neutral probability.
        v = sigma * math.sqrt(dt)
        if v < 1e-8:
            return self._deterministic_american_value(option_type, S, K, T, r, q)
        
        # Up and down factors (Cox-Ross-Rubinstein)
        u = math.exp(sigma * math.sqrt(dt))
        d = 1 / u
        
        # Risk-neutral probability
        a = math.exp((r - q) * dt)

        # If the CRR bracket condition fails, the tree becomes unstable and p can explode.
        # Fall back to the deterministic sigma->0 value.
        if not (d < a < u):
            return self._deterministic_american_value(option_type, S, K, T, r, q)

        denom = u - d
        if not math.isfinite(denom) or abs(denom) <= 1e-12:
            return self._deterministic_american_value(option_type, S, K, T, r, q)

        # Numerically stable probability computation using expm1.
        # p = (a - d) / (u - d) = expm1((r-q)dt + v) / expm1(2v)
        p = math.expm1((r - q) * dt + v) / math.expm1(2 * v)

        if not math.isfinite(p):
            return self._deterministic_american_value(option_type, S, K, T, r, q)

        # Clamp only tiny roundoff errors; otherwise treat as a model degeneracy.
        p_tol = 1e-12
        if p < -p_tol or p > 1.0 + p_tol:
            return self._deterministic_american_value(option_type, S, K, T, r, q)

        p = min(1.0, max(0.0, p))
        
        # Initialize asset prices at maturity
        prices = [S * (u ** (steps - i)) * (d ** i) for i in range(steps + 1)]
        
        # Initialize option values at maturity
        if option_type == 'call':
            values = [max(price - K, 0.0) for price in prices]
        else:
            values = [max(K - price, 0.0) for price in prices]
        
        # Step backwards through tree
        for step in range(steps - 1, -1, -1):
            for i in range(step + 1):
                # Asset price at this node
                price = S * (u ** (step - i)) * (d ** i)
                
                # Continuation value (expected value discounted)
                continuation = math.exp(-r * dt) * (p * values[i] + (1 - p) * values[i + 1])
                
                # Intrinsic value (immediate exercise)
                if option_type == 'call':
                    intrinsic = max(price - K, 0.0)
                else:
                    intrinsic = max(K - price, 0.0)
                
                # American option: max of continuation and exercise
                values[i] = max(continuation, intrinsic)
        
        return values[0]
