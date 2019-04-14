package com.shzlw.poli.dto;

public class LoginResponse {

    private String username;
    private String sysRole;
    private String error;
    private boolean isTempPassword;

    public static LoginResponse ofError(String error) {
        return new LoginResponse(error);
    }

    public static LoginResponse ofSucess(String username, String sysRole, boolean isTempPassword) {
        return new LoginResponse(username, sysRole, isTempPassword);
    }

    private LoginResponse() {};

    private LoginResponse(String error) {
        this.error = error;
    }

    private LoginResponse(String username, String sysRole, boolean isTempPassword) {
        this.username = username;
        this.sysRole = sysRole;
        this.isTempPassword = isTempPassword;
    }

    public String getUsername() {
        return username;
    }

    public String getSysRole() {
        return sysRole;
    }

    public String getError() {
        return error;
    }

    public boolean isTempPassword() {
        return isTempPassword;
    }
}