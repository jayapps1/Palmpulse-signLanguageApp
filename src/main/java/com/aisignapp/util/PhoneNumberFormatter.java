package com.aisignapp.util;

import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import com.google.i18n.phonenumbers.Phonenumber;
import org.springframework.stereotype.Component;

@Component
public class PhoneNumberFormatter {
    private final PhoneNumberUtil phoneUtil = PhoneNumberUtil.getInstance();

    public String formatToE164(String rawNumber, String defaultRegion) throws NumberParseException {
        Phonenumber.PhoneNumber number = phoneUtil.parse(rawNumber, defaultRegion);
        return phoneUtil.format(number, PhoneNumberUtil.PhoneNumberFormat.E164);
    }
}