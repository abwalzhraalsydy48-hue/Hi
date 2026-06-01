package com.abuzahra.server;

import android.Manifest;
import android.content.Context;
import android.content.SharedPreferences;
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
    private final SharedPreferences prefs;
    private static final String PREFS_NAME = "AbuZahraPrefs";

    public AndroidInterface(MainActivity activity) {
        this.activity = activity;
        this.context = activity;
        this.prefs = activity.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
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
            return "2.0";
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
    
    // ==================== Session Management ====================
    
    @JavascriptInterface
    public void saveSetting(String key, String value) {
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString(key, value);
        editor.apply();
    }
    
    @JavascriptInterface
    public String getSetting(String key, String defaultValue) {
        return prefs.getString(key, defaultValue);
    }
    
    @JavascriptInterface
    public void saveServerUrl(String url) {
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("server_url", url);
        editor.putLong("last_connection", System.currentTimeMillis());
        editor.apply();
    }
    
    @JavascriptInterface
    public String getServerUrl() {
        return prefs.getString("server_url", "https://alsydyabwalzhra.online");
    }
    
    @JavascriptInterface
    public void saveSession(String sessionData) {
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("session_data", sessionData);
        editor.putLong("session_time", System.currentTimeMillis());
        editor.apply();
    }
    
    @JavascriptInterface
    public String getSession() {
        return prefs.getString("session_data", "{}");
    }
    
    @JavascriptInterface
    public void clearSession() {
        SharedPreferences.Editor editor = prefs.edit();
        editor.remove("session_data");
        editor.remove("server_url");
        editor.apply();
    }
    
    @JavascriptInterface
    public boolean hasStoredSession() {
        return prefs.contains("session_data") || prefs.contains("server_url");
    }
    
    @JavascriptInterface
    public long getLastConnectionTime() {
        return prefs.getLong("last_connection", 0);
    }
    
    @JavascriptInterface
    public void setAutoConnect(boolean enabled) {
        SharedPreferences.Editor editor = prefs.edit();
        editor.putBoolean("auto_connect", enabled);
        editor.apply();
    }
    
    @JavascriptInterface
    public boolean isAutoConnectEnabled() {
        return prefs.getBoolean("auto_connect", true);
    }
    
    @JavascriptInterface
    public void setSelectedDevice(String deviceId) {
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("selected_device", deviceId);
        editor.apply();
    }
    
    @JavascriptInterface
    public String getSelectedDevice() {
        return prefs.getString("selected_device", "");
    }
    
    // ==================== Network Status ====================
    
    @JavascriptInterface
    public boolean isNetworkAvailable() {
        android.net.ConnectivityManager cm = (android.net.ConnectivityManager) 
            context.getSystemService(Context.CONNECTIVITY_SERVICE);
        if (cm != null) {
            android.net.NetworkCapabilities capabilities = 
                cm.getNetworkCapabilities(cm.getActiveNetwork());
            return capabilities != null && 
                   capabilities.hasCapability(android.net.NetworkCapabilities.NET_CAPABILITY_INTERNET);
        }
        return false;
    }
    
    @JavascriptInterface
    public boolean isWifiConnected() {
        android.net.ConnectivityManager cm = (android.net.ConnectivityManager) 
            context.getSystemService(Context.CONNECTIVITY_SERVICE);
        if (cm != null) {
            android.net.NetworkCapabilities capabilities = 
                cm.getNetworkCapabilities(cm.getActiveNetwork());
            return capabilities != null && 
                   capabilities.hasTransport(android.net.NetworkCapabilities.TRANSPORT_WIFI);
        }
        return false;
    }
    
    @JavascriptInterface
    public boolean isMobileDataConnected() {
        android.net.ConnectivityManager cm = (android.net.ConnectivityManager) 
            context.getSystemService(Context.CONNECTIVITY_SERVICE);
        if (cm != null) {
            android.net.NetworkCapabilities capabilities = 
                cm.getNetworkCapabilities(cm.getActiveNetwork());
            return capabilities != null && 
                   capabilities.hasTransport(android.net.NetworkCapabilities.TRANSPORT_CELLULAR);
        }
        return false;
    }
    
    // ==================== Server Connection Callback ====================
    
    @JavascriptInterface
    public void onServerConnected(String serverUrl) {
        saveServerUrl(serverUrl);
        showToast("تم حفظ إعدادات الخادم");
    }
}
