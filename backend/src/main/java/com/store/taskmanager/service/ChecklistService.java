package com.store.taskmanager.service;

import com.store.taskmanager.dto.*;
import com.store.taskmanager.entity.*;
import com.store.taskmanager.exception.AccessDeniedException;
import com.store.taskmanager.exception.BadRequestException;
import com.store.taskmanager.exception.ResourceNotFoundException;
import com.store.taskmanager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChecklistService {

    private final ChecklistRepository checklistRepository;
    private final ChecklistItemRepository checklistItemRepository;
    private final ShiftRepository shiftRepository;
    private final TeamRepository teamRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<ChecklistDTO> getAllChecklists(User currentUser) {
        List<Checklist> checklists;

        String role = currentUser.getRole().name();

        if (role.equals("SUPER_ADMIN")) {
            checklists = checklistRepository.findAll();
        } else if (role.equals("MANAGER")) {
            checklists = checklistRepository.findByTeamManagerId(currentUser.getId());
        } else if (role.equals("TEAM_LEAD")) {
            if (currentUser.getTeam() != null) {
                checklists = checklistRepository.findByTeamId(currentUser.getTeam().getId());
            } else {
                checklists = new ArrayList<>();
            }
        } else {
            if (currentUser.getTeam() != null) {
                checklists = checklistRepository.findByTeamId(currentUser.getTeam().getId());
            } else {
                checklists = new ArrayList<>();
            }
        }

        return checklists.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ChecklistDTO getChecklistById(Long id, User currentUser) {
        Checklist checklist = checklistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist not found with id: " + id));

        validateChecklistAccess(checklist, currentUser);

        return mapToDTO(checklist);
    }

    @Transactional(readOnly = true)
    public List<ChecklistDTO> getChecklistsByShift(Long shiftId, User currentUser) {
        String role = currentUser.getRole().name();

        if (role.equals("SUPER_ADMIN")) {
            return checklistRepository.findByShiftId(shiftId).stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        }
        if (role.equals("MANAGER")) {
            return checklistRepository.findByShiftId(shiftId).stream()
                    .filter(c -> c.getTeam() != null && c.getTeam().getManager() != null && c.getTeam().getManager().getId().equals(currentUser.getId()))
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        }

        if (currentUser.getTeam() == null) {
            return new ArrayList<>();
        }

        return checklistRepository.findByShiftId(shiftId).stream()
                .filter(c -> c.getTeam() != null && c.getTeam().getId().equals(currentUser.getTeam().getId()))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ChecklistDTO> getChecklistsByTeam(Long teamId, User currentUser) {
        String role = currentUser.getRole().name();

        if (role.equals("SUPER_ADMIN")) {
            return checklistRepository.findByTeamId(teamId).stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        }
        if (role.equals("MANAGER")) {
            return checklistRepository.findByTeamId(teamId).stream()
                    .filter(c -> c.getTeam() != null && c.getTeam().getManager() != null && c.getTeam().getManager().getId().equals(currentUser.getId()))
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        }

        if (currentUser.getTeam() == null || !currentUser.getTeam().getId().equals(teamId)) {
            return new ArrayList<>();
        }

        return checklistRepository.findByTeamId(teamId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ChecklistDTO> getChecklistsByTask(Long taskId, User currentUser) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        String role = currentUser.getRole().name();

        if (role.equals("SUPER_ADMIN")) {
            return checklistRepository.findByTaskId(taskId).stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        }
        if (role.equals("MANAGER")) {
            return checklistRepository.findByTaskId(taskId).stream()
                    .filter(c -> c.getTeam() != null && c.getTeam().getManager() != null
                            && c.getTeam().getManager().getId().equals(currentUser.getId()))
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        }

        if (currentUser.getTeam() == null || task.getTeam() == null
                || !currentUser.getTeam().getId().equals(task.getTeam().getId())) {
            return new ArrayList<>();
        }

        return checklistRepository.findByTaskId(taskId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ChecklistDTO createChecklist(CreateChecklistRequest request, User currentUser) {
        String role = currentUser.getRole().name();

        Team team = null;
        if (request.getTeamId() != null) {
            team = teamRepository.findById(request.getTeamId())
                    .orElseThrow(() -> new ResourceNotFoundException("Team not found"));

            if (!role.equals("SUPER_ADMIN") && !role.equals("MANAGER")) {
                if (currentUser.getTeam() == null || !currentUser.getTeam().getId().equals(team.getId())) {
                    throw new AccessDeniedException("You can only create checklists for your own team");
                }
            }
        } else {
            if (!role.equals("SUPER_ADMIN") && !role.equals("MANAGER")) {
                if (currentUser.getTeam() != null) {
                    team = currentUser.getTeam();
                } else {
                    throw new BadRequestException("You must select a team for the checklist");
                }
            }
        }

        // If taskId is provided but team is not resolved yet, infer team from task
        if (team == null && request.getTaskId() != null) {
            Task taskForTeam = taskRepository.findById(request.getTaskId())
                    .orElse(null);
            if (taskForTeam != null && taskForTeam.getTeam() != null) {
                team = taskForTeam.getTeam();
            }
        }

        // Self assignment check and hierarchy validation will be done when processing items below

        Checklist checklist = new Checklist();
        checklist.setTitle(request.getTitle());
        checklist.setDescription(request.getDescription());
        checklist.setCreatedBy(currentUser);

        if (request.getShiftId() != null) {
            Shift shift = shiftRepository.findById(request.getShiftId())
                    .orElseThrow(() -> new ResourceNotFoundException("Shift not found"));
            checklist.setShift(shift);
        }

        if (team != null) {
            checklist.setTeam(team);
        }

        if (request.getTaskId() != null) {
            Task task = taskRepository.findById(request.getTaskId())
                    .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
            checklist.setTask(task);
        }

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            List<ChecklistItem> items = new ArrayList<>();
            for (CreateChecklistItemRequest itemRequest : request.getItems()) {
                ChecklistItem item = new ChecklistItem();
                item.setTitle(itemRequest.getTitle());
                item.setDescription(itemRequest.getDescription());
                item.setChecklist(checklist);

                if (itemRequest.getAssignedToId() != null) {
                    User assignedTo = userRepository.findById(itemRequest.getAssignedToId())
                            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                    AssignmentValidator.validate(currentUser, assignedTo, team);

                    item.setAssignedTo(assignedTo);
                }

                items.add(item);
            }
            checklist.getItems().addAll(items);
        }

        checklistRepository.save(checklist);

        auditLogService.log("CHECKLIST_CREATED", "Checklist", checklist.getId(), null, "checklist created: " + checklist.getTitle(), currentUser);

        return mapToDTO(checklist);
    }

    @Transactional
    public ChecklistItemDTO completeItem(Long itemId, User currentUser) {
        ChecklistItem item = checklistItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist item not found with id: " + itemId));

        item.setCompleted(true);
        item.setCompletedBy(currentUser);
        item.setCompletedAt(LocalDateTime.now());

        checklistItemRepository.save(item);

        auditLogService.log("CHECKLIST_ITEM_COMPLETED", "ChecklistItem", itemId, null, "item completed: " + item.getTitle(), currentUser);

        return mapItemToDTO(item);
    }

    @Transactional
    public ChecklistItemDTO uncompleteItem(Long itemId, User currentUser) {
        ChecklistItem item = checklistItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist item not found with id: " + itemId));

        item.setCompleted(false);
        item.setCompletedBy(null);
        item.setCompletedAt(null);

        checklistItemRepository.save(item);

        auditLogService.log("CHECKLIST_ITEM_UNCOMPLETED", "ChecklistItem", itemId, null, "item uncompleted: " + item.getTitle(), currentUser);

        return mapItemToDTO(item);
    }

    @Transactional
    public void deleteChecklist(Long id, User currentUser) {
        Checklist checklist = checklistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist not found with id: " + id));

        validateChecklistDeleteAccess(checklist, currentUser);

        auditLogService.log("CHECKLIST_DELETED", "Checklist", id, null, "checklist deleted: " + checklist.getTitle(), currentUser);

        checklistRepository.delete(checklist);
    }

    @Transactional
    public ChecklistDTO updateChecklist(Long id, CreateChecklistRequest request, User currentUser) {
        Checklist checklist = checklistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist not found with id: " + id));

        validateChecklistEditAccess(checklist, currentUser);

        String role = currentUser.getRole().name();

        if (request.getTeamId() != null) {
            Team team = teamRepository.findById(request.getTeamId())
                    .orElseThrow(() -> new ResourceNotFoundException("Team not found"));

            if (!role.equals("SUPER_ADMIN") && !role.equals("MANAGER")) {
                if (currentUser.getTeam() == null || !currentUser.getTeam().getId().equals(team.getId())) {
                    throw new AccessDeniedException("You can only assign checklists to your own team");
                }
            }
        }

        // Self assignment check and hierarchy validation will be done when processing items below

        checklist.setTitle(request.getTitle());
        checklist.setDescription(request.getDescription());

        if (request.getShiftId() != null) {
            Shift shift = shiftRepository.findById(request.getShiftId())
                    .orElseThrow(() -> new ResourceNotFoundException("Shift not found"));
            checklist.setShift(shift);
        } else {
            checklist.setShift(null);
        }

        Team team = checklist.getTeam();
        if (request.getTeamId() != null) {
            team = teamRepository.findById(request.getTeamId())
                    .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
            checklist.setTeam(team);
        }

        checklist.getItems().clear();

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (CreateChecklistItemRequest itemRequest : request.getItems()) {
                ChecklistItem item = new ChecklistItem();
                item.setTitle(itemRequest.getTitle());
                item.setDescription(itemRequest.getDescription());
                item.setChecklist(checklist);

                if (itemRequest.getAssignedToId() != null) {
                    User assignedTo = userRepository.findById(itemRequest.getAssignedToId())
                            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                    AssignmentValidator.validate(currentUser, assignedTo, team);

                    item.setAssignedTo(assignedTo);
                }

                checklist.getItems().add(item);
            }
        }

        checklistRepository.save(checklist);

        auditLogService.log("CHECKLIST_UPDATED", "Checklist", id, null, "checklist updated: " + checklist.getTitle(), currentUser);

        return mapToDTO(checklist);
    }

    private void validateChecklistAccess(Checklist checklist, User currentUser) {
        String role = currentUser.getRole().name();

        if (role.equals("SUPER_ADMIN")) {
            return;
        }

        if (role.equals("MANAGER")) {
            if (checklist.getTeam() != null && checklist.getTeam().getManager() != null && checklist.getTeam().getManager().getId().equals(currentUser.getId())) {
                return;
            }
            throw new AccessDeniedException("You do not have access to this checklist");
        }

        if (checklist.getTeam() == null) {
            throw new AccessDeniedException("You do not have access to this checklist");
        }

        if (currentUser.getTeam() == null || !currentUser.getTeam().getId().equals(checklist.getTeam().getId())) {
            throw new AccessDeniedException("You do not have access to this checklist");
        }
    }

    private void validateChecklistDeleteAccess(Checklist checklist, User currentUser) {
        String role = currentUser.getRole().name();

        if (role.equals("SUPER_ADMIN")) {
            return;
        }

        if (role.equals("MANAGER")) {
            if (checklist.getTeam() != null && checklist.getTeam().getManager() != null && checklist.getTeam().getManager().getId().equals(currentUser.getId())) {
                return;
            }
            throw new AccessDeniedException("You do not have access to delete this checklist");
        }

        throw new AccessDeniedException("Only Super Admin and Manager can delete checklists");
    }

    private void validateChecklistEditAccess(Checklist checklist, User currentUser) {
        String role = currentUser.getRole().name();

        if (role.equals("SUPER_ADMIN")) {
            return;
        }

        if (role.equals("MANAGER")) {
            if (checklist.getTeam() != null && checklist.getTeam().getManager() != null && checklist.getTeam().getManager().getId().equals(currentUser.getId())) {
                return;
            }
            throw new AccessDeniedException("You do not have access to edit this checklist");
        }

        if (checklist.getTeam() == null) {
            throw new AccessDeniedException("You do not have access to edit this checklist");
        }

        if (currentUser.getTeam() == null || !currentUser.getTeam().getId().equals(checklist.getTeam().getId())) {
            throw new AccessDeniedException("You do not have access to edit this checklist");
        }
    }

    private ChecklistDTO mapToDTO(Checklist checklist) {
        ChecklistDTO dto = new ChecklistDTO();
        dto.setId(checklist.getId());
        dto.setTitle(checklist.getTitle());
        dto.setDescription(checklist.getDescription());
        dto.setCreatedAt(checklist.getCreatedAt());

        if (checklist.getShift() != null) {
            dto.setShiftId(checklist.getShift().getId());
            dto.setShiftName(checklist.getShift().getName());
        }

        if (checklist.getTeam() != null) {
            dto.setTeamId(checklist.getTeam().getId());
            dto.setTeamName(checklist.getTeam().getName());
        }

        if (checklist.getTask() != null) {
            dto.setTaskId(checklist.getTask().getId());
            dto.setTaskTitle(checklist.getTask().getTitle());
        }

        if (checklist.getCreatedBy() != null) {
            dto.setCreatedById(checklist.getCreatedBy().getId());
            dto.setCreatedByName(checklist.getCreatedBy().getFullName());
        }

        if (checklist.getItems() != null && !checklist.getItems().isEmpty()) {
            dto.setItems(checklist.getItems().stream()
                    .map(this::mapItemToDTO)
                    .collect(Collectors.toList()));
            long completed = checklist.getItems().stream().filter(ChecklistItem::isCompleted).count();
            dto.setProgressPercentage((int) (completed * 100 / checklist.getItems().size()));
        } else {
            dto.setProgressPercentage(0);
        }

        return dto;
    }

    private ChecklistItemDTO mapItemToDTO(ChecklistItem item) {
        ChecklistItemDTO dto = new ChecklistItemDTO();
        dto.setId(item.getId());
        dto.setTitle(item.getTitle());
        dto.setDescription(item.getDescription());
        dto.setCompleted(item.isCompleted());
        dto.setCreatedAt(item.getCreatedAt());
        dto.setCompletedAt(item.getCompletedAt());

        if (item.getChecklist() != null) {
            dto.setChecklistId(item.getChecklist().getId());
        }

        if (item.getAssignedTo() != null) {
            dto.setAssignedToId(item.getAssignedTo().getId());
            dto.setAssignedToName(item.getAssignedTo().getFullName());
        }

        if (item.getCompletedBy() != null) {
            dto.setCompletedById(item.getCompletedBy().getId());
            dto.setCompletedByName(item.getCompletedBy().getFullName());
        }

        return dto;
    }
}