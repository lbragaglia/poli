package com.shzlw.poli.dao;

import com.shzlw.poli.dao.mapper.JdbcDataSourceRowMapper;
import com.shzlw.poli.model.JdbcDataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;

@Repository
public class JdbcDataSourceDao {

    @Autowired
    JdbcTemplate jt;

    public List<JdbcDataSource> fetchAll() {
        String sql = "SELECT id, name, connection_url, username, type, ping FROM p_datasource";
        return jt.query(sql, new Object[] {}, new JdbcDataSourceRowMapper());
    }

    public JdbcDataSource fetchById(long id) {
        String sql = "SELECT id, name, connection_url, username, type, ping FROM p_datasource WHERE id=?";
        try {
            return (JdbcDataSource) jt.queryForObject(sql, new Object[]{ id }, new JdbcDataSourceRowMapper());
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    public long add(JdbcDataSource ds) {
        String sql = "INSERT INTO p_datasource(name, connection_url, username, password, type, ping) VALUES(?, ?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jt.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, ds.getName());
            ps.setString(2, ds.getConnectionUrl());
            ps.setString(3, ds.getUsername());
            ps.setString(4, ds.getPassword());
            ps.setString(5, ds.getType());
            ps.setString(6, ds.getPing());
            return ps;
        }, keyHolder);

        return keyHolder.getKey().longValue();
    }

    public int update(JdbcDataSource ds) {
        String sql = "UPDATE p_datasource SET name=?, connection_url=?, username=?, password=?, type=?, ping=? WHERE id=?";
        return jt.update(sql, new Object[]{
                ds.getName(),
                ds.getConnectionUrl(),
                ds.getUsername(),
                ds.getPassword(),
                ds.getType(),
                ds.getPing(),
                ds.getId()
        });
    }

    public int delete(long id) {
        String sql = "DELETE FROM p_datasource WHERE id=?";
        return jt.update(sql, new Object[]{ id });
    }

    public JdbcDataSource fetchByWidgetId(long id) {
        String sql = "SELECT d.id, d.name, d.connection_url, d.username, d.type, d.ping "
                    + "FROM p_datasource d, p_widget w "
                    + "WHERE w.id = ? AND d.id = w.datasource_id";
        try {
            return (JdbcDataSource) jt.queryForObject(sql, new Object[]{ id }, new JdbcDataSourceRowMapper());
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }
}