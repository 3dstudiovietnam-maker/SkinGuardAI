package com.skinguardai.app;

import android.os.Bundle;
import android.webkit.WebView;

import androidx.activity.OnBackPressedCallback;

import com.getcapacitor.BridgeActivity;

/**
 * Capacitor 8's BridgeActivity does not handle the Android Back button at all —
 * it has no onBackPressed override and registers no back callback, and this app
 * ships no Capacitor plugins (capacitor.plugins.json is empty), so nothing else
 * picks it up either. The stock behaviour is therefore that Back finishes the
 * Activity: a user three screens deep into their mole timeline taps Back and the
 * app quits instead of stepping back one screen.
 *
 * That is both a bad experience and a Google Play Minimum Functionality risk —
 * a Capacitor app is expected to behave like a native one, and a reviewer will
 * press Back. The callback below routes Back into the WebView's own history
 * (the SPA uses the History API via wouter, so canGoBack() is true after any
 * in-app navigation) and only lets the system close the app once there is
 * nowhere left to go.
 */
public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                WebView webView = getBridge() != null ? getBridge().getWebView() : null;
                if (webView != null && webView.canGoBack()) {
                    webView.goBack();
                    return;
                }
                // Nothing left in the web history: hand the press back to the
                // system so it closes the app the way the user expects. The
                // callback has to be disabled first or dispatching would land
                // straight back here and loop.
                setEnabled(false);
                getOnBackPressedDispatcher().onBackPressed();
                setEnabled(true);
            }
        });
    }
}
