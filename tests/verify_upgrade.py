
import sys
import os
import pandas as pd
import numpy as np

# Add project root
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.model import prepare_features, get_feature_cols
from src.train import MidnightTrainer

def test_features():
    print("--- Testing Feature Engineering ---")
    # Generate dummy data
    dates = pd.date_range(start='2024-01-01', periods=200, freq='1h')
    df = pd.DataFrame({
        'open': np.random.rand(200) * 100,
        'high': np.random.rand(200) * 105,
        'low': np.random.rand(200) * 95,
        'close': np.random.rand(200) * 100,
        'volume': np.random.rand(200) * 10000
    }, index=dates)
    
    try:
        df_feat = prepare_features(df)
        cols = get_feature_cols()
        print(f"Features generated: {len(cols)}")
        
        # Check specific new features
        new_feats = ['supertrend_pos', 'choppiness', 'coppock', 'ulcer', 'is_doji', 'regime_vol']
        for f in new_feats:
            if f in df_feat.columns:
                print(f"✅ {f} found.")
            else:
                print(f"❌ {f} MISSING!")
                
        return True
    except Exception as e:
        print(f"❌ Feature generation failed: {e}")
        return False

def test_training_logic():
    print("\n--- Testing Training Logic ---")
    # Initialize trainer
    trainer = MidnightTrainer(symbol='BTC-USD', device='cpu')
    
    # Mock data download to avoid network calls and waiting
    # We will inject data manually into verify step if needed, but trainer.train() calls download.
    # So we will just try to run one epoch if data exists, or mock the download method.
    
    # Let's mock download_multi_timeframe_data
    def mock_download(start, end):
        print("Mocking data download...")
        dates = pd.date_range(start=start, end=end, freq='1h')
        if len(dates) == 0:
            dates = pd.date_range(end=end, periods=200, freq='1h')
        
        df = pd.DataFrame({
            'open': np.random.uniform(50000, 60000, len(dates)),
            'high': np.random.uniform(50000, 60000, len(dates)),
            'low': np.random.uniform(50000, 60000, len(dates)),
            'close': np.random.uniform(50000, 60000, len(dates)),
            'volume': np.random.uniform(100, 1000, len(dates))
        }, index=dates)
        return {'1h': df}
        
    trainer.download_multi_timeframe_data = mock_download
    
    try:
        # Run 1 epoch
        print("Starting 1 epoch test run...")
        trainer.train(epochs=1, batch_size=4, session_num=999)
        print("✅ Training loop completed without error.")
    except Exception as e:
        print(f"❌ Training failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    if test_features():
        test_training_logic()
