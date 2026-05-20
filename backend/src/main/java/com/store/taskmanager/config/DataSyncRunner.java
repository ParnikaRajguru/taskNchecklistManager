package com.store.taskmanager.config;

import com.store.taskmanager.service.TeamService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSyncRunner implements ApplicationRunner {

    private final TeamService teamService;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        log.info("Starting user-team relationship synchronization...");
        try {
            String result = teamService.syncUserTeamRelationships();
            log.info("Data sync completed: {}", result);
        } catch (Exception e) {
            log.error("Data sync failed: {}", e.getMessage());
        }
    }
}