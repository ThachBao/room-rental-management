package com.thachbao.room_rental_management.controller;

import com.thachbao.room_rental_management.dto.request.room.RoomCreateRequest;
import com.thachbao.room_rental_management.dto.request.room.RoomUpdateRequest;
import com.thachbao.room_rental_management.dto.response.room.RoomResponse;
import com.thachbao.room_rental_management.enums.RoomStatus;
import com.thachbao.room_rental_management.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {
    private final RoomService roomService;

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('LANDLORD', 'TENANT')")
    public List<RoomResponse> getAllRooms(
            @RequestParam(required = false) RoomStatus status
            ){
        if(status != null){
            return roomService.getRoomsByStatus(status);
        }
        return roomService.getAllRooms();
    }

    @GetMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('LANDLORD', 'TENANT')")
    public RoomResponse getRoomById(@PathVariable Long id){
        return roomService.getRoomById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('LANDLORD')")
    public RoomResponse createRoom(@Valid @RequestBody
                                   RoomCreateRequest request){
        return roomService.createRoom(request);
    }

    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('LANDLORD')")
    public RoomResponse updateRoom(
            @PathVariable Long id,
            @Valid @RequestBody RoomUpdateRequest request
            ){
        return roomService.updateRoom(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('LANDLORD')")
    public void inactiveRoom(@PathVariable Long id){
        roomService.inactiveRoom(id);
    }
}
