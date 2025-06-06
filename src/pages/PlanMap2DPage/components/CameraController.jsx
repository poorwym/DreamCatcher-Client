import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Slider, 
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import { 
  CameraAlt as CameraIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  CenterFocusStrong as FocusIcon,
  ThreeDRotation as RotationIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import '../../../assets/style.css';

// "camera": {
//     "focal_length": 35.0,
//         "position": [
//         120.1536,
//         30.2875,
//         100.0
//     ],
//         "rotation": [
//         0.0,
//         0.0,
//         0.0,
//         1.0
//     ]
// }
function CameraController({camera, setCamera}) {
    const [localCamera, setLocalCamera] = useState({
        focal_length: 35.0,
        position: [120.1536, 30.2875, 100.0],
        rotation: [0.0, 0.0, 0.0, 1.0]
    });

    const [expanded, setExpanded] = useState(false);

    // 初始化本地相机状态
    useEffect(() => {
        if (camera) {
            setLocalCamera(camera);
        }
    }, [camera]);

    // 更新相机参数
    const updateCamera = (newCamera) => {
        setLocalCamera(newCamera);
        setCamera(newCamera);
    };

    // 处理焦距变化
    const handleFocalLengthChange = (event, value) => {
        const newCamera = {
            ...localCamera,
            focal_length: value
        };
        updateCamera(newCamera);
    };

    // 处理位置变化
    const handlePositionChange = (index, value) => {
        const newPosition = [...localCamera.position];
        newPosition[index] = parseFloat(value) || 0;
        const newCamera = {
            ...localCamera,
            position: newPosition
        };
        updateCamera(newCamera);
    };

    // 处理旋转变化
    const handleRotationChange = (index, value) => {
        const newRotation = [...localCamera.rotation];
        newRotation[index] = parseFloat(value) || 0;
        const newCamera = {
            ...localCamera,
            rotation: newRotation
        };
        updateCamera(newCamera);
    };

    // 重置为默认值
    const resetCamera = () => {
        const defaultCamera = {
            focal_length: 35.0,
            position: [120.1536, 30.2875, 100.0],
            rotation: [0.0, 0.0, 0.0, 1.0]
        };
        updateCamera(defaultCamera);
    };

    return (
        <Card 
            className="bg-secondary/90 backdrop-blur-lg rounded-xl shadow-2xl border border-primary/30 transition-all duration-300 ease-out hover:border-primary/50 hover:shadow-xl hover:scale-101 mb-8"
            sx={{ 
                backgroundColor: 'transparent',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                    backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.95)',
                    boxShadow: '0 0 30px rgba(14, 165, 233, 0.3), 0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                }
            }}
        >
            <CardContent className="p-6">
                <Box className="flex items-center justify-between mb-6">
                    <Box className="flex items-center gap-3">
                        <CameraIcon 
                            sx={{ 
                                color: 'var(--accent-blue)', 
                                fontSize: '2rem',
                                filter: 'drop-shadow(0 0 8px rgba(14, 165, 233, 0.4))',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        />
                        <Typography 
                            variant="h6" 
                            className="text-contrast font-bold uppercase tracking-wider"
                            sx={{ 
                                color: 'var(--text-contrast)',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                textShadow: '0 0 10px rgba(255, 255, 255, 0.3)'
                            }}
                        >
                            CAMERA CONTROL
                        </Typography>
                    </Box>
                    <Tooltip title="重置为默认值">
                        <IconButton 
                            onClick={resetCamera}
                            sx={{
                                color: 'var(--accent-blue)',
                                border: '1px solid rgba(var(--border-primary-rgb), 0.3)',
                                padding: '8px',
                                '&:hover': {
                                    backgroundColor: 'rgba(var(--bg-primary-rgb), 0.1)',
                                    borderColor: 'rgba(var(--border-primary-rgb), 0.5)',
                                    transform: 'scale(1.05)'
                                }
                            }}
                        >
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Box>

                <Box className="space-y-6">
                    {/* 焦距控制 */}
                    <Box 
                        className="bg-secondary/50 backdrop-blur-md rounded-lg p-4 border border-primary/20 transition-all duration-300 hover:border-primary/40 hover:bg-secondary/70"
                        sx={{
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                boxShadow: '0 0 20px rgba(14, 165, 233, 0.2), 0 8px 25px -8px rgba(0, 0, 0, 0.25)'
                            }
                        }}
                    >
                        <Box className="flex items-center gap-3 mb-4">
                            <FocusIcon 
                                sx={{ 
                                    color: 'var(--accent-blue)', 
                                    fontSize: '1.5rem',
                                    filter: 'drop-shadow(0 0 6px rgba(14, 165, 233, 0.4))'
                                }}
                            />
                            <Typography 
                                variant="subtitle1" 
                                className="text-contrast font-semibold uppercase tracking-wide"
                                sx={{ 
                                    color: 'var(--text-contrast)',
                                    fontWeight: 600
                                }}
                            >
                                FOCAL LENGTH
                            </Typography>
                            <Chip 
                                label={`${localCamera.focal_length}MM`}
                                size="small"
                                sx={{
                                    backgroundColor: 'var(--accent-blue)',
                                    color: 'var(--text-contrast)',
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    filter: 'drop-shadow(0 0 4px rgba(14, 165, 233, 0.5))'
                                }}
                            />
                        </Box>
                        <Slider
                            value={localCamera.focal_length}
                            onChange={handleFocalLengthChange}
                            min={10}
                            max={200}
                            step={1}
                            valueLabelDisplay="auto"
                            sx={{
                                '& .MuiSlider-thumb': {
                                    backgroundColor: 'var(--accent-blue)',
                                    border: '2px solid var(--accent-blue)',
                                    width: 20,
                                    height: 20,
                                    filter: 'drop-shadow(0 0 8px rgba(14, 165, 233, 0.5))',
                                    '&:hover': {
                                        boxShadow: '0 0 0 8px rgba(14, 165, 233, 0.16)',
                                        transform: 'scale(1.1)'
                                    },
                                },
                                '& .MuiSlider-track': {
                                    backgroundColor: 'var(--accent-blue)',
                                    height: 4,
                                    border: 'none'
                                },
                                '& .MuiSlider-rail': {
                                    backgroundColor: 'var(--border-subtle)',
                                    height: 4
                                },
                                '& .MuiSlider-valueLabel': {
                                    backgroundColor: 'var(--accent-blue)',
                                    fontSize: '0.75rem',
                                    fontWeight: 600
                                },
                            }}
                        />
                    </Box>

                    {/* 位置控制 */}
                    <Accordion 
                        expanded={expanded} 
                        onChange={() => setExpanded(!expanded)}
                        className="bg-secondary/50 backdrop-blur-md border border-primary/20 transition-all duration-300 hover:border-primary/40"
                        sx={{
                            '&.MuiAccordion-root': {
                                backgroundColor: 'transparent',
                                boxShadow: 'none',
                                borderRadius: '8px',
                                '&:before': {
                                    display: 'none',
                                },
                                '&:hover': {
                                    boxShadow: '0 0 20px rgba(16, 185, 129, 0.2), 0 8px 25px -8px rgba(0, 0, 0, 0.25)'
                                }
                            },
                        }}
                    >
                        <AccordionSummary
                            expandIcon={
                                <ExpandMoreIcon 
                                    sx={{ 
                                        color: 'var(--accent-green)',
                                        filter: 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.4))'
                                    }} 
                                />
                            }
                            className="px-4"
                        >
                            <Box className="flex items-center gap-3">
                                <LocationIcon 
                                    sx={{ 
                                        color: 'var(--accent-green)', 
                                        fontSize: '1.5rem',
                                        filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.4))'
                                    }}
                                />
                                <Typography 
                                    variant="subtitle1" 
                                    className="text-contrast font-semibold uppercase tracking-wide"
                                    sx={{ 
                                        color: 'var(--text-contrast)',
                                        fontWeight: 600
                                    }}
                                >
                                    POSITION COORDINATES
                                </Typography>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails className="px-4 pb-4">
                            <Box className="grid grid-cols-1 gap-4">
                                {[
                                    { label: "经度 (LONGITUDE)", index: 0, step: 0.0001 },
                                    { label: "纬度 (LATITUDE)", index: 1, step: 0.0001 },
                                    { label: "高度 (ALTITUDE)", index: 2, step: 1 }
                                ].map((field) => (
                                    <TextField
                                        key={field.index}
                                        label={field.label}
                                        type="number"
                                        value={localCamera.position[field.index]}
                                        onChange={(e) => handlePositionChange(field.index, e.target.value)}
                                        size="small"
                                        fullWidth
                                        inputProps={{ step: field.step }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                backgroundColor: 'rgba(var(--bg-tertiary-rgb), 0.5)',
                                                color: 'var(--text-main)',
                                                '& fieldset': {
                                                    borderColor: 'rgba(var(--border-primary-rgb), 0.3)',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: 'var(--accent-green)',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: 'var(--accent-green)',
                                                    boxShadow: '0 0 8px rgba(16, 185, 129, 0.3)'
                                                },
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: 'var(--text-secondary)',
                                                fontSize: '0.8rem',
                                                fontWeight: 500,
                                                '&.Mui-focused': {
                                                    color: 'var(--accent-green)',
                                                },
                                            },
                                        }}
                                    />
                                ))}
                            </Box>
                        </AccordionDetails>
                    </Accordion>

                    {/* 旋转控制 */}
                    <Accordion 
                        className="bg-secondary/50 backdrop-blur-md border border-primary/20 transition-all duration-300 hover:border-primary/40"
                        sx={{
                            '&.MuiAccordion-root': {
                                backgroundColor: 'transparent',
                                boxShadow: 'none',
                                borderRadius: '8px',
                                '&:before': {
                                    display: 'none',
                                },
                                '&:hover': {
                                    boxShadow: '0 0 20px rgba(245, 158, 11, 0.2), 0 8px 25px -8px rgba(0, 0, 0, 0.25)'
                                }
                            },
                        }}
                    >
                        <AccordionSummary
                            expandIcon={
                                <ExpandMoreIcon 
                                    sx={{ 
                                        color: 'var(--accent-orange)',
                                        filter: 'drop-shadow(0 0 4px rgba(245, 158, 11, 0.4))'
                                    }} 
                                />
                            }
                            className="px-4"
                        >
                            <Box className="flex items-center gap-3">
                                <RotationIcon 
                                    sx={{ 
                                        color: 'var(--accent-orange)', 
                                        fontSize: '1.5rem',
                                        filter: 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.4))'
                                    }}
                                />
                                <Typography 
                                    variant="subtitle1" 
                                    className="text-contrast font-semibold uppercase tracking-wide"
                                    sx={{ 
                                        color: 'var(--text-contrast)',
                                        fontWeight: 600
                                    }}
                                >
                                    QUATERNION ROTATION
                                </Typography>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails className="px-4 pb-4">
                            <Box className="grid grid-cols-2 gap-3 mb-3">
                                {['X', 'Y', 'Z', 'W'].map((axis, index) => (
                                    <TextField
                                        key={axis}
                                        label={`${axis} AXIS`}
                                        type="number"
                                        value={localCamera.rotation[index]}
                                        onChange={(e) => handleRotationChange(index, e.target.value)}
                                        size="small"
                                        inputProps={{ step: 0.01 }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                backgroundColor: 'rgba(var(--bg-tertiary-rgb), 0.5)',
                                                color: 'var(--text-main)',
                                                '& fieldset': {
                                                    borderColor: 'rgba(var(--border-primary-rgb), 0.3)',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: 'var(--accent-orange)',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: 'var(--accent-orange)',
                                                    boxShadow: '0 0 8px rgba(245, 158, 11, 0.3)'
                                                },
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: 'var(--text-secondary)',
                                                fontSize: '0.75rem',
                                                fontWeight: 500,
                                                '&.Mui-focused': {
                                                    color: 'var(--accent-orange)',
                                                },
                                            },
                                        }}
                                    />
                                ))}
                            </Box>
                            <Typography 
                                variant="caption" 
                                className="text-secondary block uppercase tracking-wider"
                                sx={{ 
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.7rem',
                                    fontWeight: 300
                                }}
                            >
                                QUATERNION FORMAT: [X, Y, Z, W]
                            </Typography>
                        </AccordionDetails>
                    </Accordion>

                    {/* 当前参数摘要 */}
                    <Box 
                        className="bg-secondary/30 backdrop-blur-sm rounded-lg p-4 border border-primary/20"
                        sx={{
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.4)',
                                borderColor: 'rgba(var(--border-primary-rgb), 0.3)'
                            }
                        }}
                    >
                        <Typography 
                            variant="subtitle2" 
                            className="text-primary mb-3 uppercase tracking-wider"
                            sx={{ 
                                color: 'var(--text-primary)',
                                fontSize: '0.8rem',
                                fontWeight: 600
                            }}
                        >
                            CURRENT PARAMETERS
                        </Typography>
                        <Box className="space-y-2">
                            <Typography 
                                variant="body2" 
                                className="text-main font-mono"
                                sx={{ 
                                    color: 'var(--text-main)',
                                    fontSize: '0.8rem'
                                }}
                            >
                                FOCAL: {localCamera.focal_length}MM
                            </Typography>
                            <Typography 
                                variant="body2" 
                                className="text-main font-mono"
                                sx={{ 
                                    color: 'var(--text-main)',
                                    fontSize: '0.8rem'
                                }}
                            >
                                POS: [{localCamera.position[0].toFixed(4)}, {localCamera.position[1].toFixed(4)}, {localCamera.position[2].toFixed(1)}]
                            </Typography>
                            <Typography 
                                variant="body2" 
                                className="text-main font-mono"
                                sx={{ 
                                    color: 'var(--text-main)',
                                    fontSize: '0.8rem'
                                }}
                            >
                                ROT: [{localCamera.rotation.map(r => r.toFixed(2)).join(', ')}]
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}

export default CameraController;