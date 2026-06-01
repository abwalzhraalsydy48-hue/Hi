package com.abuzahra.server;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationManager;
import android.os.BatteryManager;
import android.os.Build;
import android.telephony.TelephonyManager;
import android.webkit.JavascriptInterface;

import androidx.core.app.ActivityCompat;

import org.json.JSONObject;

/**
 * JavaScript Interface for native Android features
 * Allows the web app to access native device features
 */
public class AndroidInterface {

    private final MainActivity activity;
    private final Context context;

    public AndroidInterface(MainActivity activity) {
        this.activity = activity;
        this.context = activity;
    }

    @JavascriptInterface
    public String getDeviceInfo() {
        try {
            JSONObject device = new JSONObject();
            device.put("brand", Build.BRAND);
            device.put("model", Build.MODEL);
            device.put("manufacturer", Build.MANUFACTURER);
            device.put("device", Build.DEVICE);
            device.put("product", Build.PRODUCT);
            device.put("androidVersion", Build.VERSION.RELEASE);
            device.put("sdkVersion", Build.VERSION.SDK_INT);
            device.put("board", Build.BOARD);
            device.put("fingerprint", Build.FINGERPRINT);
            return device.toString();
        } catch (Exception e) {
            return "{}";
        }
    }

    @JavascriptInterface
    public String getBatteryInfo() {
        try {
            BatteryManager bm = (BatteryManager) context.getSystemService(Context.BATTERY_SERVICE);
            JSONObject battery = new JSONObject();
            
            if (bm != null) {
                int level = bm.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY);
                battery.put("level", level);
                battery.put("isCharging", bm.isCharging());
            }
            
            return battery.toString();
        } catch (Exception e) {
            return "{}";
        }
    }

    @JavascriptInterface
    public String getNetworkInfo() {
        try {
            TelephonyManager tm = (TelephonyManager) context.getSystemService(Context.TELEPHONY_SERVICE);
            JSONObject network = new JSONObject();
            
            if (tm != null) {
                network.put("networkOperatorName", tm.getNetworkOperatorName());
                network.put("networkCountryIso", tm.getNetworkCountryIso());
                network.put("phoneType", tm.getPhoneType());
                network.put("networkType", tm.getNetworkType());
            }
            
            return network.toString();
        } catch (Exception e) {
            return "{}";
        }
    }

    @JavascriptInterface
    public String getLocation() {
        try {
            LocationManager lm = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);
            JSONObject location = new JSONObject();
            
            if (lm != null && ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                Location loc = lm.getLastKnownLocation(LocationManager.GPS_PROVIDER);
                if (loc == null) {
                    loc = lm.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);
                }
                
                if (loc != null) {
                    location.put("latitude", loc.getLatitude());
                    location.put("longitude", loc.getLongitude());
                    location.put("accuracy", loc.getAccuracy());
                    location.put("altitude", loc.getAltitude());
                    location.put("speed", loc.getSpeed());
                    location.put("time", loc.getTime());
                }
            }
            
            return location.toString();
        } catch (Exception e) {
            return "{}";
        }
    }

    @JavascriptInterface
    public void showToast(String message) {
        activity.runOnUiThread(() -> {
            android.widget.Toast.makeText(context, message, android.widget.Toast.LENGTH_SHORT).show();
        });
    }

    @JavascriptInterface
    public void vibrate(long milliseconds) {
        android.os.Vibrator v = (android.os.Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
        if (v != null && v.hasVibrator()) {
            v.vibrate(milliseconds);
        }
    }

    @JavascriptInterface
    public boolean hasPermission(String permission) {
        return ActivityCompat.checkSelfPermission(context, permission) == PackageManager.PERMISSION_GRANTED;
    }

    @JavascriptInterface
    public void requestPermission(String permission) {
        ActivityCompat.requestPermissions(activity, new String[]{permission}, 1001);
    }

    @JavascriptInterface
    public String getAppVersion() {
        try {
            return context.getPackageManager().getPackageInfo(context.getPackageName(), 0).versionName;
        } catch (Exception e) {
            return "1.0.0";
        }
    }

    @JavascriptInterface
    public String getAppName() {
        return "أبو الزهراء";
    }

    @JavascriptInterface
    public void exitApp() {
        activity.finish();
    }

    @JavascriptInterface
    public void reloadApp() {
        activity.runOnUiThread(() -> {
            // Reload the web view
        });
    }
}
