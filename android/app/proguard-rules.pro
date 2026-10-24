# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# --- Capacitor bridge -------------------------------------------------------
# The bridge finds plugin classes and methods by reflection at runtime, and
# serialises call results across the JS/WebView boundary. Stripping or
# renaming any of this breaks native<->JS calls silently — the app still
# installs and launches, it just stops responding to buttons — so it is kept
# explicitly rather than discovered after a release build ships broken.
-keep class com.getcapacitor.** { *; }
-keep public class * extends com.getcapacitor.Plugin
-keepclassmembers public class * extends com.getcapacitor.Plugin {
    @com.getcapacitor.PluginMethod public *;
}
-keepattributes *Annotation*

# The WebView's own JS interface objects (how Capacitor's bridge talks to
# the page) are found by reflection too.
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# --- Cordova-style community plugins ----------------------------------------
# @capacitor-community/speech-recognition and text-to-speech ship as
# Cordova-style plugins under this package.
-keep class org.apache.cordova.** { *; }

# --- Google ML Kit (on-device translation, language identification) --------
# ML Kit loads model and task classes by reflection; over-aggressive
# shrinking is a known cause of "translation silently does nothing" reports
# for Capacitor + ML Kit apps.
-keep class com.google.mlkit.** { *; }
-keep class com.google.android.gms.internal.mlkit** { *; }

# Safety net: warn, never fail. If a class referenced above doesn't exist in
# a future dependency version, this keeps the release build compiling instead
# of hard-failing on a missing-class error over a rule that just isn't
# needed any more.
-dontwarn com.google.mlkit.**
-dontwarn com.google.android.gms.**
-dontwarn org.apache.cordova.**

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile
