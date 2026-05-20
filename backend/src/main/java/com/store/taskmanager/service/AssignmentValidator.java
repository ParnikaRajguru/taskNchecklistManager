package com.store.taskmanager.service;

import com.store.taskmanager.entity.Team;
import com.store.taskmanager.entity.User;
import com.store.taskmanager.entity.enums.Role;
import com.store.taskmanager.exception.BadRequestException;

public class AssignmentValidator {

    public static void validate(User currentUser, User assignedTo, Team targetTeam) {
        if (assignedTo == null) {
            // Task/Checklist can be unassigned, but if there is a targetTeam, validate access to it
            validateTeamAccess(currentUser, targetTeam);
            return;
        }

        Role curRole = currentUser.getRole();
        Role assRole = assignedTo.getRole();

        // 1. Self assignment check (excluding self assignment for all roles)
        if (currentUser.getId().equals(assignedTo.getId())) {
            throw new BadRequestException("You cannot assign tasks or checklist items to yourself.");
        }

        // 2. Target team access check
        validateTeamAccess(currentUser, targetTeam);

        // 3. Hierarchy checks
        if (curRole == Role.SUPER_ADMIN) {
            // Super admin can assign to anyone (except themselves, which is handled above)
            return;
        }

        if (curRole == Role.MANAGER) {
            // Manager can assign ONLY to TEAM_LEAD, DEVELOPER, TESTER, STAFF
            if (assRole == Role.SUPER_ADMIN || assRole == Role.MANAGER) {
                throw new BadRequestException("Managers cannot assign to Super Admins or other Managers.");
            }
            // Manager should only assign within their own managed teams/projects
            if (assignedTo.getTeam() == null) {
                throw new BadRequestException("Assigned user must belong to a team.");
            }
            Team assTeam = assignedTo.getTeam();
            if (assTeam.getManager() == null || !assTeam.getManager().getId().equals(currentUser.getId())) {
                throw new BadRequestException("You can only assign to users within your managed teams.");
            }
            if (targetTeam != null && !targetTeam.getId().equals(assTeam.getId())) {
                throw new BadRequestException("Assigned user team must match target team.");
            }
            return;
        }

        if (curRole == Role.TEAM_LEAD) {
            // Team Lead can assign ONLY to DEVELOPER, TESTER, STAFF of their own team
            if (assRole == Role.SUPER_ADMIN || assRole == Role.MANAGER || assRole == Role.TEAM_LEAD) {
                throw new BadRequestException("Team Leads cannot assign to Super Admins, Managers, or other Team Leads.");
            }
            if (currentUser.getTeam() == null) {
                throw new BadRequestException("You do not belong to any team.");
            }
            Team leadTeam = currentUser.getTeam();
            Team assTeam = assignedTo.getTeam();
            if (assTeam == null || !assTeam.getId().equals(leadTeam.getId())) {
                throw new BadRequestException("You can only assign to members of your own team.");
            }
            if (targetTeam != null && !targetTeam.getId().equals(leadTeam.getId())) {
                throw new BadRequestException("Task/Checklist team must match your team.");
            }
            return;
        }

        // STAFF, DEVELOPER, TESTER
        if (curRole == Role.STAFF || curRole == Role.DEVELOPER || curRole == Role.TESTER) {
            // Staff can assign ONLY to STAFF level members of their own team (DEVELOPER, TESTER, STAFF)
            if (assRole == Role.SUPER_ADMIN || assRole == Role.MANAGER || assRole == Role.TEAM_LEAD) {
                throw new BadRequestException("Staff members cannot assign to Super Admins, Managers, or Team Leads.");
            }
            if (currentUser.getTeam() == null) {
                throw new BadRequestException("You do not belong to any team.");
            }
            Team staffTeam = currentUser.getTeam();
            Team assTeam = assignedTo.getTeam();
            if (assTeam == null || !assTeam.getId().equals(staffTeam.getId())) {
                throw new BadRequestException("You can only assign to members of your own team.");
            }
            if (targetTeam != null && !targetTeam.getId().equals(staffTeam.getId())) {
                throw new BadRequestException("Task/Checklist team must match your team.");
            }
            return;
        }

        throw new BadRequestException("Invalid role configuration.");
    }

    private static void validateTeamAccess(User currentUser, Team targetTeam) {
        if (targetTeam == null) {
            return;
        }
        Role role = currentUser.getRole();
        if (role == Role.SUPER_ADMIN) {
            return;
        }
        if (role == Role.MANAGER) {
            if (targetTeam.getManager() == null || !targetTeam.getManager().getId().equals(currentUser.getId())) {
                throw new BadRequestException("You do not have access to the target team.");
            }
            return;
        }
        if (currentUser.getTeam() == null || !currentUser.getTeam().getId().equals(targetTeam.getId())) {
            throw new BadRequestException("You can only access your own team's tasks/checklists.");
        }
    }
}
